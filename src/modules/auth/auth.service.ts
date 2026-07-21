import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma.js";
import { loginInput, registerInput } from "./auth.schema.js";
import { generateRefreshToken, generateToken } from "../../utils/jwt.utility.js";
import { AppError } from "../../errors/AppError.js";
import { RegisterFiles } from "./auth.types.js";
import jwt from "jsonwebtoken";

export const register = async (data: registerInput, files: RegisterFiles) => {
  const { workspaceName, email, name, password } = data;

  const logoFile = files && files.logo ? files.logo[0] : null;
  const avatarFile = files && files.avatar ? files.avatar[0] : null;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const existingWorkspace = await prisma.workspace.findUnique({
    where: { name: workspaceName },
  });

  if (existingWorkspace) {
    throw new AppError("Workspace name already exists", 409);
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const workspace = await prisma.workspace.create({
    data: {
      name: workspaceName,
      logo: logoFile?.path ?? null,
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      avatar: avatarFile?.path ?? null,
    },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  const token = generateToken({
    userId: user.id,
    workspaceId: workspace.id,
    role: "OWNER",
  });

  return {
    success: true,
    message: "User registered successfully",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  };
};

export const login = async (data: loginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      memberships: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }

  if (!user.memberships || user.memberships.length === 0) {
    throw new AppError("User is not a member of any workspace", 403);
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: user.memberships[0].workspaceId,
    },
  });

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  const token = generateToken({
    userId: user.id,
    workspaceId: workspace.id,
    role: user.memberships[0].role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken: refreshToken,
    },
  });
  return {
    success: true,
    message: "Login successful",
    data: {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  };
};

export const logoutService = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: null,
    },
  });

  return { message: "Logout successful" };
};

export const refreshTokenService = async (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
    userId: number;
  };

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      refreshToken: true,
      memberships: true,
    },
  });

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("Invalid refresh token", 403);
  }

  if (!user.memberships.length) {
    throw new AppError("No memberships found", 404);
  }

  const membership = user.memberships[0];

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: membership.workspaceId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  const token = generateToken({
    userId: user.id,
    workspaceId: workspace.id,
    role: membership.role,
  });

  return {
    success: true,
    message: "Token refreshed successfully",
    data: {
      token,
    },
  };
};
export const getProfileService = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true, // ⚡ Fixed: Use your schema's native 'avatar' field instead of avatarUrl
      memberships: {
        where: { isDeleted: false },
        select: {
          role: true,
          workspace: {
            select: {
              id: true,
              name: true,
              logo: true,
              isDeleted: true,
              _count: {
                select: {
                  members: { where: { isDeleted: false } },
                  projects: { where: { isDeleted: false } },
                  tasks: { where: { isDeleted: false } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const workspaces = user.memberships
    .filter((m) => m.workspace && m.workspace.isDeleted !== true)
    .map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      logo: m.workspace.logo,
      role: m.role,
      isDeleted: m.workspace.isDeleted,
      totalMembers: m.workspace._count.members,
      totalProjects: m.workspace._count.projects,
      totalTasks: m.workspace._count.tasks,
    }));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar, // ⚡ Directly available for your frontend UserAvatar components
    workspaces,
  };
};

export const updateProfileService = async (
  userId: number,
  workspaceId: number | null,
  projectId: number | null,
  updateData: any,
  files: any
) => {
  // 1. Process files using the key sent from the client
  let uploadedAvatarPath = updateData.avatar;
  if (files && files.avatar) {
    uploadedAvatarPath = files.avatar[0].path;
  }

  // 2. Perform the database write update targeting 'avatar'
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: updateData.name,
      avatar: uploadedAvatarPath, // ⚡ Fixed alignment to database column definition
    },
  });

  // 3. Reuse getProfileService so the returned structure matches perfectly!
  return await getProfileService(userId);
};
export const signupWithInvitation = async (data: any, files: RegisterFiles) => {
  const { token, name, password } = data;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    throw new AppError("Invalid invitation token", 404);
  }

  let user = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);

    user = await prisma.user.create({
      data: {
        email: invitation.email,
        name,
        password: hashedPassword,
        avatar: files && files.avatar && files.avatar[0] ? files.avatar[0].path : null,
      },
    });
  } else {
    if (files && files.avatar && files.avatar[0]) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: files.avatar[0].path,
        },
      });
    }
  }

  await prisma.workspaceMember.create({
    data: {
      workspaceId: invitation.workspaceId,
      userId: user.id,
      role: invitation.role,
    },
  });

  await prisma.invitation.update({
    where: { token },
    data: { status: "ACCEPTED" },
  });

  const authToken = generateToken({
    userId: user.id,
    workspaceId: invitation.workspaceId,
    role: invitation.role,
  });

  return {
    success: true,
    message: "Member registered successfully",
    data: {
      token: authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      role: invitation.role,
    },
  };
};