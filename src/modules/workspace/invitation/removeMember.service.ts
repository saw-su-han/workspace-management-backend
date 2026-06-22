import { AppError } from "../../../errors/AppError";
import { prisma } from "../../../utils/prisma";

export const removeMemberService = async (
  workspaceId: number,
  userId: number,
  targetId: number,
) => {
  // 1. Get requester
  const user = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  // 2. Get target (FIXED)
  const target = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetId,
      },
    },
  });

  // 3. Validate requester
  if (!user) {
    throw new AppError("User is not a member of this workspace", 403);
  }

  // 4. Validate target
  if (!target) {
    throw new AppError("Target user is not a member of this workspace", 404);
  }

  // 5. Self remove block
  if (userId === targetId) {
    throw new AppError("You cannot remove yourself", 400);
  }

  // 6. Owner cannot be removed
  if (target.role === "OWNER") {
    throw new AppError("Owner cannot be removed", 403);
  }

  // 7. OWNER logic
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

  // 8. ADMIN logic
  if (user.role === "ADMIN") {
    if (target.role !== "MEMBER") {
      throw new AppError("Admin can only remove members", 403);
    }

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

  // 9. MEMBER fallback
  throw new AppError("You do not have permission to remove members", 403);
};
