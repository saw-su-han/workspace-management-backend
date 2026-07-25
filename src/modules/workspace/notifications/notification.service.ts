import nodemailer from "nodemailer";
import { prisma } from "../../../utils/prisma.js";
import AppError from "../../../errors/AppError.js";
import { transporter } from "../../../utils/mail.js";
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

  await prisma.userNotification.createMany({
    data: userIds.map((userId) => ({
      userId,
      notificationId: notification.id,
    })),
  });

  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      email: true,
      name: true,
    },
  });

  await Promise.all(
    users.map((user) =>
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `New Notification - ${type}`,
        html: `
          <h3>Hello ${user.name}</h3>
          <p>${message}</p>
        `,
      }),
    ),
  );

  return notification;
};

export const getUserNotificationsService = async (
  workspaceId: number,
  userId: number,
) => {
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
  const result = await prisma.userNotification.updateMany({
    where: {
      notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });

  if (result.count === 0) {
    throw new AppError("Notification not found");
  }

  return result;
};
