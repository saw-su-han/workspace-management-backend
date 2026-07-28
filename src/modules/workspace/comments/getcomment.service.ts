import { number } from "zod";
import { AppError } from "../../../errors/AppError.js";
import { prisma } from "../../../utils/prisma.js";

export const getCommentsService = async (
    userId: number,
    workspaceId: number,
    taskId: number,
) => {
    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId,
            }
        }
    });

    if (!member) {
        throw new AppError("You are not a member of this workspace", 403);
    }

    const comments = await prisma.comment.findMany({
        where: {
            taskId,
            task: {
                workspaceId,
                isDeleted: false,
            }
        },
        orderBy: {
            createdAt: 'asc',
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                }
            }
        }
    });

    return comments;
};

export const updateCommentService = async (
    userId: number,
    workspaceId: number,
    taskId: number,
    commentId: number,
    content: string,
) => {
    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId,
            }
        }
    });

    if (!member) {
        throw new AppError("You are not a member of this workspace", 403);
    }

    const comment = await prisma.comment.findFirst({
        where: {
            id: commentId,
            taskId,
            task: {
                workspaceId,
                isDeleted: false,
            }
        }
    });

    if (!comment) {
        throw new AppError("Comment not found", 404);
    }

    if (comment.authorId !== userId) {
        throw new AppError("You can only edit your own comment", 403);
    }

    const updatedComment = await prisma.comment.update({
        where: {
            id: commentId,
        },
        data: {
            content,
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                }
            }
        }
    });
    return updatedComment;
};

export const deleteCommentService = async (
    userId: number,
    workspaceId: number,
    taskId: number,
    commentId: number,
) => {
    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId,
            }
        }
    });
    if (!member) {
        throw new AppError("You are not a member of this workspace", 403);
    }

    const comment = await prisma.comment.findFirst({
        where: {
            id: commentId,
            taskId,
            task: {
                workspaceId,
                isDeleted: false,
            }
        }
    });

    if (!comment) {
        throw new AppError("Comment not found", 404);
    }

    if (comment.authorId !== userId) {
        throw new AppError("You can only delete your own comment", 403);
    }

    await prisma.comment.delete({
        where: {
            id: commentId,
        }
    });
    return {
        message: "Comment deleted successfully",
    }
}