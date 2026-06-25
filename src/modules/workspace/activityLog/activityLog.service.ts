import { prisma } from "../../../utils/prisma";

export const getActivityLogsService = async (
  workspaceId: number,
  userId: number,
  role: string,
) => {
  if (!["OWNER", "ADMIN"].includes(role)) {
    throw new Error("Forbidden");
  }

  const logs = await prisma.activityLog.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return logs;
};
