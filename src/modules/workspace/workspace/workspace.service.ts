import AppError from "../../../errors/AppError";
import { prisma } from "../../../utils/prisma";

export const createWorkspaceService = async (
  userId: number,
  data: {
    workspaceName: string;
  },
  logoFile?: Express.Multer.File,
) => {
  // Check user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Check workspace name
  const existingWorkspace = await prisma.workspace.findUnique({
    where: {
      name: data.workspaceName,
    },
  });

  if (existingWorkspace) {
    throw new AppError("Workspace name already exists", 409);
  }

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: data.workspaceName,
      logo: logoFile?.path ?? null,
    },
  });

  // Make creator OWNER
  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  // Activity Log
  await prisma.activityLog.create({
    data: {
      workspaceId: workspace.id,
      userId,
      action: `Created workspace ${workspace.name}`,
      entityType: "WORKSPACE",
      entityId: workspace.id,
    },
  });

  return workspace;
};

export const getWorkSpaceDetailsService = async (
  workspaceId: number,
  userId: number,
) => {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError("You are not a member of this workspace");
  }

  if (member.role !== "OWNER") {
    throw new AppError("only workspace owner can view workspace details", 403);
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          members: true,
          projects: true,
          tasks: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  return {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    totalMembers: workspace._count.members,
    totalProjects: workspace._count.projects,
    totalTasks: workspace._count.tasks,
  };
};

export const updateWorkspaceDetailsService = async (
  workspaceId: number,
  userId: number,
  data: { name?: string },
  logoFile?: Express.Multer.File,
) => {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError("You are not a member of this workspace");
  }

  if (member.role !== "OWNER") {
    throw new AppError("only workspace owner can view workspace details", 403);
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
      isDeleted: false,
    },
  });

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  if (data.name && data.name !== workspace.name) {
    const existingWorkspace = await prisma.workspace.findUnique({
      where: {
        name: data.name,
        isDeleted: false,
      },
    });

    if (existingWorkspace) {
      throw new AppError("Workspace name already exists", 404);
    }
  }

  const updateWorkspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      name: data.name ?? workspace.name,
      logo: logoFile?.path ?? workspace.logo,
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: `Updated workspace ${workspace.name}`,
      entityType: "WORKSPACE",
      entityId: workspace.id,
    },
  });

  return updateWorkspace;
};

export const deleteWorkspaceService = async (
  workspaceId: number,
  userId: number,
  confirm: boolean,
) => {
  if (!confirm) {
    throw new AppError("Deletion confirmation required", 400);
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError("You are not a member of this workspace", 403);
  }

  if (member.role !== "OWNER") {
    throw new AppError("Only workspace owner can delete workspace", 403);
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace || workspace.isDeleted) {
    throw new AppError("Workspace not found", 404);
  }

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return {
    success: true,
    message: "Workspace deleted successfully",
    data: updated,
  };
};
