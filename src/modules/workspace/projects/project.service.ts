import { number, string } from "zod";
import { prisma } from "../../../utils/prisma";
import { AppError } from "../../../errors/AppError";
import da from "zod/v4/locales/da.js";

export const createProjectService = async (
  userId: number,
  workspaceId: number,
  data: {
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
  },
) => {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) throw new Error("You are not a member of this workspace");

  if (member.role === "MEMBER") {
    throw new Error("You are not authorized to create projects");
  }
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      workspaceId,
      createdById: userId,
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: `Created project ${project.name}`,
      entityType: "PROJECT",
      entityId: project.id,
    },
  });

  return project;
};

export const getProjectService = async (
  userId: number,
  workspaceId: number,
  search?: string,
  status?: "PLANNING" | "ACTIVE" | "COMPLETED",
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
    throw new Error("You are not a member of this workspace");
  }

  return await prisma.project.findMany({
    where: {
      workspaceId,
      isDeleted: false,

      // SEARCH
      name: search
        ? {
            contains: search,
            mode: "insensitive",
          }
        : undefined,

      // STATUS FILTER
      status: status ?? undefined,

      ...(member.role === "MEMBER"
        ? {
            members: {
              some: {
                userId,
              },
            },
          }
        : {}),
    },
  });
};
//getProjectDetails
export const getProjectDetailsService = async (
  userId: number,
  workspaceId: number,
  projectId: number,
) => {
  // 1. Check workspace membership
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!workspaceMember) {
    throw new Error("You are not a member of this workspace");
  }

  // 2. Check project exists inside workspace

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,

      members: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      tasks: true,
    },
  });
  if (!project) {
    throw new Error("Project not found");
  }

  // 3. MEMBER restriction (only assigned projects allowed)
  if (workspaceMember.role === "MEMBER") {
    const isAssigned = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    if (!isAssigned) {
      throw new Error("You are not allowed to view this project");
    }
  }

  return project;
};

//assignProject
export const assignProjectService = async (
  requesterId: number,
  workspaceId: number,
  projectId: number,
  targetUserId: number,
) => {
  // Check requester is workspace member
  const requester = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: requesterId,
      },
    },
  });

  if (!requester) {
    throw new Error("You are not a member of this workspace");
  }

  // Only OWNER / ADMIN can assign
  if (requester.role === "MEMBER") {
    throw new Error("You are not authorized to assign members");
  }

  // Check project belongs to workspace
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId,
    },
  });

  if (!project) {
    throw new Error("Project not found in this workspace");
  }

  // Check target user belongs to same workspace
  const targetMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetUserId,
      },
    },
  });

  if (!targetMember) {
    throw new Error("User is not a member of this workspace");
  }

  // Prevent duplicate assignment
  const existingAssignment = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: targetUserId,
      },
    },
  });

  if (existingAssignment) {
    throw new Error("User is already assigned to this project");
  }

  return await prisma.projectMember.create({
    data: {
      projectId,
      userId: targetUserId,
    },
  });
};

//updateProject
export const updateProjectService = async (
  userId: number,
  workspaceId: number,
  projectId: number,
  data: {
    name?: string;
    description?: string;
    status?: "PLANNING" | "ACTIVE" | "COMPLETED";
    startDate?: string;
    endDate?: string;
  },
) => {
  //check
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError("You are not a member of this workspace ");
  }

  if (member.role === "MEMBER") {
    throw new AppError("You are not authorized to update this project");
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      workspaceId,
    },
  });
  if (!project) {
    throw new AppError("Project not found");
  }

  const updateProject = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });

  return updateProject;
};

export const deleteProjectService = async (
  userId: number,
  workspaceId: number,
  projectId: number,
  confirm: boolean,
) => {
  if (!confirm) {
    throw new Error("Deletion confirmation required");
  }

  // Check workspace membership
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this workspace");
  }

  // Only OWNER can delete
  if (member.role !== "OWNER") {
    throw new Error("Only workspace owner can delete projects");
  }

  // Check project
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  return {
    message: "Project deleted successfully",
  };
};
