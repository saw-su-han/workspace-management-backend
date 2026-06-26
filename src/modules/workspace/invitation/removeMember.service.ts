import { AppError } from "../../../errors/AppError";
import { prisma } from "../../../utils/prisma";

export const removeMemberService = async (
  workspaceId: number,
  userId: number,
  targetId: number,
) => {
  const user = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  const target = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetId,
      },
    },
  });

  if (!user) {
    throw new AppError("User is not a member of this workspace", 403);
  }

  if (!target) {
    throw new AppError("Target user is not a member of this workspace", 404);
  }

  if (userId === targetId) {
    throw new AppError("You cannot remove yourself", 400);
  }

  if (target.role === "OWNER") {
    throw new AppError("Owner cannot be removed", 403);
  }

  if (user.role === "OWNER") {
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetId,
        },
      },
    });

    return {
      success: true,
      message: "Member removed successfully",
    };
  }

  if (user.role === "ADMIN") {
    if (target.role !== "MEMBER") {
      throw new AppError("Admin can only remove members", 403);
    }

    await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetId,
        },
      },
      data: {
        isDeleted: true,
      },
    });

    return {
      success: true,
      message: "Member removed successfully",
    };
  }
  throw new AppError("You do not have permission to remove members", 403);
};
