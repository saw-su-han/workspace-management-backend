import { th } from "zod/locales";
import { AppError } from "../../../errors/AppError";
import { prisma } from "../../../utils/prisma";
import da from "zod/v4/locales/da.js";

//createTasks
export const createTaskService = async (
  userId: number,
  workspaceId: number,
  data: {
    projectId: number;
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string;
    assignedTo?: number;
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

  if (!member) {
    throw new AppError("You are not a member of this workspace");
  }

  if (member.role === "MEMBER") {
    throw new AppError("You are not authorized to create tasks");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: data.projectId,
      workspaceId,
    },
  });

  if (!project) {
    throw new AppError("Project not found in this workspace");
  }

  if (data.assignedTo) {
    const assignMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: data.assignedTo,
        },
      },
    });

    if (!assignMember) {
      throw new AppError("Assigned user is  not exist in this workspace");
    }
  }

  //create
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority ?? "MEDIUM",
      status: "TODO",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,

      projectId: project.id,
      workspaceId: project.workspaceId,

      assignedTo: data.assignedTo ?? null,
    },
  });

  return task;
};

//getTasks
export const getTasksService = async (userId: number, workspaceId: number) => {
  // Check workspace
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

  //  OWNER / ADMIN
  if (member.role !== "MEMBER") {
    return await prisma.task.findMany({
      where: {
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
  }

  // assigned MEMBER
  return await prisma.task.findMany({
    where: {
      workspaceId,
      assignedTo: userId,
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
    throw new Error("Task not found");
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
      throw new Error("You are not allowed to view this task");
    }
  }

  return task;
};

//update

export const updateTaskService = async (
  userId: number,
  workspaceId: number,
  taskId: number,
  data: {
    title?: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate?: string;
    assignedTo?: number;
  },
) => {
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
    throw new Error("You are not a member of this workspace");
  }

  //  Only OWNER / ADMIN can update
  if (member.role === "MEMBER") {
    throw new Error("You are not authorized to update tasks");
  }

  //  Check task exists in workspace
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
    },
  });

  if (!task) {
    throw new Error("Task not found in this workspace");
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
      throw new Error("Assigned user is not in this workspace");
    }
  }

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
    },
  });

  if (!task) {
    throw new AppError("Task not found");
  }

  if (task.assignedTo !== userId) {
    throw new AppError("You can only update your assigned task");
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
    throw new Error("You are not a member of this workspace");
  }

  if (member.role === "MEMBER") {
    throw new Error("You are not authorized to delete tasks");
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
    },
  });

  if (!task) {
    throw new Error("Task not found in this workspace");
  }

  const deletedTask = await prisma.task.delete({
    where: {
      id: taskId,
    },
  });
};
