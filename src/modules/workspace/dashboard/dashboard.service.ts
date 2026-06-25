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

  const assignedProjects = await prisma.project.findMany({
    where: {
      workspaceId,
      members: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });
  const assignedTasks = await prisma.task.findMany({
    where: {
      workspaceId,
      assignedTo: userId,
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
    },
  });
  const completedTasks = await prisma.task.count({
    where: {
      workspaceId,
      assignedTo: userId,
      status: "DONE",
    },
  });
  const pendingTasks = await prisma.task.count({
    where: {
      workspaceId,
      assignedTo: userId,
      status: {
        not: "DONE",
      },
    },
  });
  return {
    assignedProjects,
    assignedTasks,
    completedTasks,
    pendingTasks,
  };
};
export const getMyDashboardController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const userId = req.user.userId;

    const result = await getDashboardService(userId, workspaceId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
