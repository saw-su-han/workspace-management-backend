import { AppError } from "../../../errors/AppError";
import { prisma } from "../../../utils/prisma";

export const createCommentService = async (
  userId: number,
  workspaceId: number,
  taskId: number,
  content: string,
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
  });

  if (!task) {
    throw new AppError("Task not found in this workspace", 404);
  }

  const comment = await prisma.comment.create({
    data: {
      taskId,
      authorId: userId,
      content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return comment;
};
