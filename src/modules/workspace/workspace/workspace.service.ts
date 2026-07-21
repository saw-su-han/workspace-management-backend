import AppError from "../../../errors/AppError.js";
import { prisma } from "../../../utils/prisma.js";

export const createWorkspaceService = async (
  userId: number,
  data: {
    workspaceName: string;
  },
  logoFile?: Express.Multer.File,
) => {
  // 1. Defend immediately against unparsed or missing form payload variables
  if (!data || !data.workspaceName) {
    throw new AppError("Workspace name payload variable is missing or blank.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 2. Safe unique search validation
  const existingWorkspace = await prisma.workspace.findUnique({
    where: {
      name: data.workspaceName,
    },
  });

  if (existingWorkspace) {
    throw new AppError("Workspace name already exists", 409);
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: data.workspaceName,
      logo: logoFile?.path ?? null,
    },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "OWNER",
    },
  });

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
    throw new AppError("You are not a member of this workspace", 403);
  }

  if (member.role !== "OWNER") {
    throw new AppError("Only workspace owners can view deep configuration details", 403);
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      logo: true,
      _count: {
        select: {
          members: true, // Keep total workspace members count
          projects: {
            where: { isDeleted: false }, // Only count active projects
          },
          tasks: {
            where: { isDeleted: false }, // Only count active tasks (assuming Task table also has isDeleted)
          },
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
    workspaceLogo: workspace.logo,
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
    throw new AppError("You are not a member of this workspace", 403);
  }

  if (member.role !== "OWNER") {
    throw new AppError("Only workspace owners can update workspace configurations", 403);
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

  // Changed from findUnique to findFirst to avoid compound multi-field criteria limits on unique queries
  if (data.name && data.name !== workspace.name) {
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        name: data.name,
        isDeleted: false,
      },
    });

    if (existingWorkspace) {
      throw new AppError("Workspace name already taken by another active hub", 409);
    }
  }

  const updatedWorkspace = await prisma.workspace.update({
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
      action: `Updated workspace configuration settings from ${workspace.name} to ${updatedWorkspace.name}`,
      entityType: "WORKSPACE",
      entityId: workspace.id,
    },
  });

  return updatedWorkspace;
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
    throw new AppError("Only workspace owners can initiate safe-deletion procedures", 403);
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace || workspace.isDeleted) {
    throw new AppError("Target workspace not found or already inactive", 404);
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
    message: "Workspace flagged as deleted successfully",
    data: updated,
  };
};

export const getWorkspaceInfoService = async (
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
    throw new AppError("You are not authorized to view this structural module context", 403);
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      logo: true,
    },
  });

  if (!workspace) {
    throw new AppError("Workspace context not found", 404);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  if (!user) {
    throw new AppError("User context not found", 404);
  }

  return {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    workspaceLogo: workspace.logo,
    userName: user.name,
  };
};