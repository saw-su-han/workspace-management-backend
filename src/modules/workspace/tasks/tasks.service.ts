import { th } from "zod/locales";
import { AppError } from "../../../errors/AppError";
import { prisma } from "../../../utils/prisma";
import da from "zod/v4/locales/da.js";
import { createNotificationService } from "../notifications/notification.service";

//createTasks
export const createTaskService = async (
  userId: number,
  data: {
    workspaceId: number;
    projectId: number;
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string;
  },
) => {
  const workspaceId = Number(data.workspaceId);

  if (!workspaceId || isNaN(workspaceId)) {
    throw new AppError("workspaceId is required", 400);
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member || member.role === "MEMBER") {
    throw new AppError("Not authorized to create tasks", 403);
  }

  const project = await prisma.project.findFirst({
    where: {
      id: data.projectId,
      workspaceId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority ?? "MEDIUM",
      status: "TODO",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: project.id,
      workspaceId: data.workspaceId,
      assignedTo: null,
    },
  });

  return task;
};

export const assignTaskService = async (
  userId: number,
  workspaceId: number,
  taskId: number,
  assignedTo: number,
) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
      isDeleted: false,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const assigner = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!assigner) {
    throw new AppError("You are not a workspace member", 403);
  }

  const assignee = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: assignedTo,
      },
    },
  });

  if (!assignee) {
    throw new AppError("Assigned user is not a workspace member", 404);
  }

  if (assigner.role === "MEMBER") {
    throw new AppError("Members cannot assign tasks", 403);
  }

  if (assigner.role === "ADMIN" && assignee.role !== "MEMBER") {
    throw new AppError("Admin can only assign tasks to members", 403);
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      assignedTo,
    },
  });

  const assignedUser = await prisma.user.findUnique({
    where: { id: assignedTo },
    select: {
      name: true,
      email: true,
      avatar: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: `Assigned task "${task.title}" to ${assignedUser?.name} (${assignedUser?.email})`,
      entityType: "TASK",
      entityId: task.id,
    },
  });

  await createNotificationService({
    workspaceId,
    type: "TASK_ASSIGNED",
    message: `You were assigned to task "${task.title}" by user ${userId}`,
    taskId,
    userIds: [assignedTo],
  });

  return updatedTask;
};
//getTasks
export const getTasksService = async (
  userId: number,
  workspaceId: number,
  search?: string,
  status?: "TODO" | "IN_PROGRESS" | "DONE",
  assignedTo?: number,
  projectId?: number,
) => {
  // 1. Check workspace membership
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

  const baseWhere: any = {
    workspaceId,
    isDeleted: false,

    title: search
      ? {
          contains: search,
          mode: "insensitive",
        }
      : undefined,

    status: status ?? undefined,

    assignedTo: assignedTo ?? undefined,

    // PROJECT FILTER
    projectId: projectId ?? undefined,
  };

  if (member.role === "MEMBER") {
    baseWhere.assignedTo = userId;
  }

  // Query
  return await prisma.task.findMany({
    where: baseWhere,

    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      dueDate: true,

      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },

      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

//gettaskDetails
export const getTaskDetailsService = async (
  userId: number,
  workspaceId: number,
  taskId: number,
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

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      dueDate: true,

      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },

      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 403);
  }

  // MEMBER
  if (member.role === "MEMBER") {
    const isAssignedToUser = task.assignee?.id === userId;

    const isInAssignedProject = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.project.id,
          userId,
        },
      },
    });

    if (!isAssignedToUser && !isInAssignedProject) {
      throw new AppError("You are not allowed to view this task", 403);
    }
  }

  return task;
};

//update

export const updateTaskService = async (
  userId: number,
  taskId: number,
  data: {
    workspaceId: number;
    title?: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate?: string;
    assignedTo?: number;
  },
) => {
  const workspaceId = Number(data.workspaceId);

  if (!workspaceId || isNaN(workspaceId)) {
    throw new AppError("workspaceId is required", 400);
  }
  //  Check workspace member
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

  //  Only OWNER / ADMIN can update
  if (member.role === "MEMBER") {
    throw new AppError("You are not authorized to update tasks", 403);
  }

  //  Check task exists in workspace
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
      isDeleted: false,
    },
  });

  if (!task) {
    throw new AppError("Task not found in this workspace", 403);
  }

  // Validate assigned user
  if (data.assignedTo) {
    const assignedMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: data.assignedTo,
        },
      },
    });

    if (!assignedMember) {
      throw new AppError("Assigned user is not in this workspace", 403);
    }
  }
  const oldStatus = task.status;

  // 5. Update task
  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assignedTo: data.assignedTo,
    },
  });
  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: `Changed task ${task.title} status from ${oldStatus} to ${updatedTask.status}`,
      entityType: "TASK",
      entityId: task.id,
      metadata: {
        from: oldStatus,
        to: updatedTask,
      },
    },
  });
  return updatedTask;
};

export const updateTaskStatusService = async (
  userId: number,
  workspaceId: number,
  taskId: number,
  status: "todo" | "in-progress" | "done",
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

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
      workspaceId,
      isDeleted: false,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 403);
  }

  if (task.assignedTo !== userId) {
    throw new AppError("You can only update your assigned task", 403);
  }
  const statusMap: any = {
    todo: "TODO",
    "in-progress": "IN_PROGRESS",
    done: "DONE",
  };

  // Update ONLY status
  const updated = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status: statusMap[status],
    },
  });
  return updated;
};

export const deleteTaskService = async (
  userId: number,
  workspaceId: number,
  taskId: number,
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

  if (member.role === "MEMBER") {
    throw new AppError("You are not authorized to delete tasks", 403);
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
    },
  });

  if (!task || task.isDeleted) {
    throw new AppError("Task not found in this workspace", 403);
  }

  const deletedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
  return deletedTask;
};
