import { Request, Response } from "express";
import {
  createNotificationService,
  getUserNotificationsService,
  markAsReadService,
} from "./notification.service";

export const createNotificationController = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const { type, message, taskId, userIds } = req.body;

    const notification = await createNotificationService({
      workspaceId,
      type,
      message,
      taskId,
      userIds,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNotificationsController = async (req: any, res: Response) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const userId = req.user.userId;

    const notifications = await getUserNotificationsService(
      workspaceId,
      userId,
    );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const markAsReadController = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const notificationId = Number(req.params.notificationId);

    await markAsReadService(notificationId, userId);

    res.status(200).json({
      success: true,
      message: "Marked as read",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
