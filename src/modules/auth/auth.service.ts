import bcrypt from "bcrypt";
import { prisma } from "../../utils/prisma";
import { loginInput, registerInput } from "./auth.schema";
import { generateRefreshToken, generateToken } from "../../utils/jwt.utility";
import { AppError } from "../../errors/AppError";
import { RegisterFiles } from "./auth.types";
import jwt from "jsonwebtoken";
import { number } from "zod";
import th from "zod/v4/locales/th.js";
export const register = async (data: registerInput, files: RegisterFiles) => {
  const { workspaceName, email, name, password } = data;

  const logoFile = files?.logo?.[0];
  const avatarFile = files?.avatar?.[0];

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
    throw new Error("User not found");
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
      memberships: true,
    },
  });

  if (!user || !user.memberships || user.memberships.length === 0) {
    throw new AppError("User not found or no memberships", 404);
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: user.memberships[0].workspaceId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  return { success: true, data: { user, workspace } };
};

export const updateProfileService = async (
  userId: number,
  workspaceId: number,
  projectId: number,
  data: { name?: string } = {},
  files: RegisterFiles = {},
) => {
  const avatarFile = files.avatar?.[0];

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name ?? user.name,
      avatar: avatarFile?.path ?? user.avatar,
    },
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  });

  return updatedUser;
};

export const signupWithInvitation = async (data: any, files: RegisterFiles) => {
  const { token, name, password } = data;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    throw new AppError("Invalid invitation token", 404);
  }

  // check or create user
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
        avatar: files?.avatar?.[0]?.path ?? null,
      },
    });
  } else {
    if (files?.avatar?.[0]?.path) {
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
      role: invitation.role, // MEMBER / ADMIN
    },
  });

  // mark invitation accepted
  await prisma.invitation.update({
    where: { token },
    data: { status: "ACCEPTED" },
  });

  // generate token
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
