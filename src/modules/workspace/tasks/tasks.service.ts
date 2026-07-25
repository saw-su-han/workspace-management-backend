import { AppError } from "../../../errors/AppError.js";
import { prisma } from "../../../utils/prisma.js";
import { createNotificationService } from "../notifications/notification.service.js";
import { transporter } from "../../../utils/mail.js";

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
    assignedTo?: number;
  },
) => {
  const workspaceId = Number(data.workspaceId);

  if (!workspaceId || isNaN(workspaceId)) {
    throw new AppError("workspaceId is required", 400);
  }

  const title = data.title?.trim();
  if (!title) {
    throw new AppError("Task title is required", 400);
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
      isDeleted: false,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  let assignedTo: number | undefined;
  if (data.assignedTo) {
    const assignee = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: data.assignedTo },
      },
    });
    if (!assignee) {
      throw new AppError("Assigned user is not a workspace member", 404);
    }
    if (member.role === "ADMIN" && assignee.role === "OWNER") {
      throw new AppError("Admin cannot assign tasks to the workspace owner", 403);
    }
    assignedTo = data.assignedTo;
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: data.description,
      priority: data.priority ?? "MEDIUM",
      status: "TODO",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: project.id,

      workspaceId: project.workspaceId,
      assignedTo: assignedTo ?? null,
    },
  });

  if (assignedTo) {
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedTo },
      select: { name: true, email: true },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId,
        userId,
        action: `Created task "${task.title}" and assigned it to ${assignedUser?.name} (${assignedUser?.email})`,
        entityType: "TASK",
        entityId: task.id,
      },
    });

    await createNotificationService({
      workspaceId,
      type: "TASK_ASSIGNED",
      message: `You were assigned to task "${task.title}" by user ${userId}`,
      taskId: task.id,
      userIds: [assignedTo],
    });

    if (assignedUser?.email) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: assignedUser.email,
          subject: `You've been assigned to "${task.title}"`,
          html: `
            <p>Hi ${assignedUser.name || "there"},</p>
            <p>You were assigned to a new task: <strong>${task.title}</strong>${data.description ? `: ${data.description}` : "."}</p>
            ${data.dueDate ? `<p>Due: ${new Date(data.dueDate).toLocaleDateString()}</p>` : ""}
          `,
        });
      } catch (mailErr) {
        console.error("Failed to send task-assignment email:", mailErr);
      }
    }
  }

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

  // ADMIN can assign to a MEMBER or another ADMIN (including themselves);
  // only assigning up to the OWNER is blocked.
  if (assigner.role === "ADMIN" && assignee.role === "OWNER") {
    throw new AppError("Admin cannot assign tasks to the workspace owner", 403);
  }

  //update
  const existAssignedTask = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });
  if (!existAssignedTask) {
    throw new AppError("Task not found");
  }

  if (existAssignedTask.assignedTo === assignedTo) {
    throw new AppError("User already assigned to this task");
  }

  const previousAssigneeId = existAssignedTask.assignedTo;
  const isReassignment = !!previousAssigneeId;

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

  const assigner_user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const previousAssignee = isReassignment
    ? await prisma.user.findUnique({
      where: { id: previousAssigneeId! },
      select: { name: true, email: true },
    })
    : null;

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: isReassignment
        ? `Reassigned task "${task.title}" from ${previousAssignee?.name ?? "someone"} to ${assignedUser?.name} (${assignedUser?.email})`
        : `Assigned task "${task.title}" to ${assignedUser?.name} (${assignedUser?.email})`,
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

  if (isReassignment && previousAssigneeId !== assignedTo) {
    await createNotificationService({
      workspaceId,
      type: "TASK_UNASSIGNED",
      message: `You were unassigned from task "${task.title}" by user ${userId}`,
      taskId,
      userIds: [previousAssigneeId!],
    });
  }
  const taskLink = `${process.env.CLIENT_URL}/workspaces/${workspaceId}/tasks/${task.id}`;
  console.log(process.env.EMAIL_USER);
  if (assignedUser?.email) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: assignedUser.email,
        subject: `New Task Assigned: ${task.title}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; line-height: 1.6;">
          <h2 style="color: #0ea5e9;">Task Assignment</h2>

          <p>Hello <strong>${assignedUser.name || "there"}</strong>,</p>

          <p>
            <strong>${assigner_user?.name || "A workspace member"}</strong>
            has ${isReassignment ? "reassigned" : "assigned"} a task to you.
          </p>

          <p><strong>Task:</strong> ${task.title}</p>

          ${task.description
            ? `<p><strong>Description:</strong> ${task.description}</p>`
            : ""
          }

          ${task.dueDate
            ? `<p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>`
            : ""
          }

          <p>
            <a href="${taskLink}"
               style="background:#0ea5e9;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
              View Task
            </a>
          </p>

          <p>Thank you,<br><strong>Workspace Management System</strong></p>
        </div>
      `,
      });
    } catch (mailErr) {
      console.error("Failed to send task-assignment email:", mailErr);
    }
  }

  return updatedTask;
};

export const getTasksQueryService = async (
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

    baseWhere.OR = [
      { assignedTo: userId },
      { project: { members: { some: { userId } } } },
    ];
  }
  console.log("Logged in user:", userId);
  console.log("Role:", member.role);
  console.log("Workspace:", workspaceId);
  console.log(baseWhere);
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
      projectId: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
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
      isDeleted: false,
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

  // 2. Fetch existing task
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

  const oldStatus = task.status;
  const isMember = member.role.toUpperCase() === "MEMBER";

  // 3. MEMBER ROLE VALIDATIONS
  if (isMember) {
    // Check if member is assigned to this task
    if (task.assignedTo !== userId) {
      throw new AppError("You can only update your assigned task", 403);
    }

    // Explicitly reject requests attempting to modify non-status fields
    const hasForbiddenChanges =
      data.title !== undefined ||
      data.description !== undefined ||
      data.priority !== undefined ||
      data.dueDate !== undefined ||
      (data.assignedTo !== undefined && data.assignedTo !== userId);

    if (hasForbiddenChanges) {
      throw new AppError("Members can only update task status", 403);
    }

    // Require status field to be passed
    if (!data.status) {
      throw new AppError("Status is required for status updates", 400);
    }

    // Update ONLY status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: data.status },
    });

    // Log member activity
    await prisma.activityLog.create({
      data: {
        workspaceId,
        userId,
        action: `Updated status for task "${task.title}"`,
        entityType: "TASK",
        entityId: task.id,
        metadata: {
          from: oldStatus,
          to: updatedTask.status,
        },
      },
    });

    return updatedTask;
  }

  // 4. OWNER / ADMIN FULL UPDATE
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title ?? task.title,
      description: data.description ?? task.description,
      priority: data.priority ?? task.priority,
      status: data.status ?? task.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : task.dueDate,
      assignedTo: data.assignedTo !== undefined ? data.assignedTo : task.assignedTo,
    },
  });

  // Log owner/admin activity
  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: `Updated task "${task.title}"`,
      entityType: "TASK",
      entityId: task.id,
      metadata: {
        from: oldStatus,
        to: updatedTask.status,
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
  //  Verify workspace membership
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
      isDeleted: false,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  //  Authorization: Members can only update tasks assigned to them
  // (Owners/Admins can update status for any task in the workspace)
  const isMember = member.role.toUpperCase() === "MEMBER";
  if (isMember && task.assignedTo !== userId) {
    throw new AppError("Members can only update tasks assigned to them", 403);
  }

  // Map API status string to DB enum
  const statusMap: Record<string, "TODO" | "IN_PROGRESS" | "DONE"> = {
    todo: "TODO",
    "in-progress": "IN_PROGRESS",
    done: "DONE",
  };

  const dbStatus = statusMap[status];
  if (!dbStatus) {
    throw new AppError("Invalid task status provided", 400);
  }

  // 5. Update ONLY task status
  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status: dbStatus,
    },
  });

  return updatedTask;
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