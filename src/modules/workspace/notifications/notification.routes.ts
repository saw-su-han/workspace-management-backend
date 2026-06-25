import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import {
  createNotificationController,
  getNotificationsController,
  markAsReadController,
} from "./notification.controller";

const router = express.Router();

router.post(
  "/workspaces/:workspaceId/notifications",
  authMiddleware,
  createNotificationController,
);

router.get(
  "/workspaces/:workspaceId/notifications",
  authMiddleware,
  getNotificationsController,
);

router.patch(
  "/notifications/:notificationId/read",
  authMiddleware,
  markAsReadController,
);

export default router;
