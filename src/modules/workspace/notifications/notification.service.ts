import { prisma } from "../../../utils/prisma";

interface CreateNotificationInput {
  workspaceId: number;
  type: string;
  message: string;
  taskId?: number;
  userIds: number[];
}

export const createNotificationService = async ({
  workspaceId,
  type,
  message,
  taskId,
  userIds,
}: CreateNotificationInput) => {
  const notification = await prisma.notification.create({
    data: {
      workspaceId,
      type,
      message,
      taskId,
    },
  });

  // attach users
  await prisma.userNotification.createMany({
    data: userIds.map((userId) => ({
      userId,
      notificationId: notification.id,
    })),
  });

  return notification;
};

export const getUserNotificationsService = async (
  workspaceId: number,
  userId: number,
) => {
  return prisma.userNotification.findMany({
    where: {
      userId,
      notification: {
        workspaceId,
      },
    },
    select: {
      notification: true,
    },
  });
};

export const markAsReadService = async (
  notificationId: number,
  userId: number,
) => {
  return prisma.userNotification.updateMany({
    where: {
      notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });
};
