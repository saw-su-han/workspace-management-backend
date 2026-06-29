import { AppError } from "../../../errors/AppError";
import { prisma } from "../../../utils/prisma";

export const getDashboardService = async (
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
  if (member.role !== "OWNER" && member.role !== "ADMIN") {
    throw new AppError("You are not authorized to access this dashboard", 403);
  }
  const totalMembers = await prisma.workspaceMember.count({
    where: {
      workspaceId,
    },
  });
  const totalAdmins = await prisma.workspaceMember.count({
    where: {
      workspaceId,
      role: "ADMIN",
    },
  });
  const totalOwners = await prisma.workspaceMember.count({
    where: {
      workspaceId,
      role: "OWNER",
    },
  });

  const totalTasks = await prisma.task.count({
    where: {
      workspaceId,
    },
  });
  const completedTasks = await prisma.task.count({
    where: {
      workspaceId,
      status: "DONE",
    },
  });
  const pendingTasks = await prisma.task.count({
    where: {
      workspaceId,
      status: {
        in: ["TODO", "IN_PROGRESS"],
      },
    },
  });
  const overdueTasks = await prisma.task.count({
    where: {
      workspaceId,
      status: {
        not: "DONE",
      },
      dueDate: {
        lt: new Date(),
      },
    },
  });
  return {
    totalMembers,
    totalAdmins,
    totalOwners,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
  };
};

export const getDashboardMemberService = async (
  userId: number,
  workspaceId: number,
  page: number = 1,
  limit: number = 10,
  search?: string,
) => {
  // Check if user belongs to workspace
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

  const skip = (page - 1) * limit;

  const projectDetails = {
    workspaceId,
    members: {
      some: {
        userId,
      },
    },
    ...(search && {
      name: {
        contains: search,
        mode: "insensitive" as const,
      },
    }),
  };

  const taskDetails = {
    workspaceId,
    assignedTo: userId, // Change this to assignedToId if that's your schema
    ...(search && {
      title: {
        contains: search,
        mode: "insensitive" as const,
      },
    }),
  };

  const [
    assignedProjects,
    assignedTasks,
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
  ] = await Promise.all([
    prisma.project.findMany({
      where: projectDetails,
      select: {
        id: true,
        name: true,
        status: true,
      },
      skip,
      take: limit,
    }),

    prisma.task.findMany({
      where: taskDetails,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
      },
      skip,
      take: limit,
    }),

    prisma.project.count({
      where: projectDetails,
    }),

    prisma.task.count({
      where: taskDetails,
    }),

    prisma.task.count({
      where: {
        workspaceId,
        assignedTo: userId,
        status: "DONE",
      },
    }),

    prisma.task.count({
      where: {
        workspaceId,
        assignedTo: userId,
        status: {
          not: "DONE",
        },
      },
    }),
  ]);
  console.log(userId, workspaceId);
  return {
    assignedProjects,
    assignedTasks,
    completedTasks,
    pendingTasks,
    pagination: {
      page,
      limit,
      totalProjects,
      totalTasks,
      totalProjectPages: Math.ceil(totalProjects / limit),
      totalTaskPages: Math.ceil(totalTasks / limit),
    },
  };
};
