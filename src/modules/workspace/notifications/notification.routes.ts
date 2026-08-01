import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import {
  clearAllNotificationsController,
  getNotificationsController,
  getUnreadNotificationCountController,
  markAllAsReadController,
  markAsReadController,
} from "./notification.controller.js";
import { upload } from "../../../middleware/upload.middleware.js";
import { createWorkspaceController } from "../workspace/workspace.controller.js";
import { asyncHandler } from "../../../errors/asyncHandler.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  upload.single("logo"),
  asyncHandler(createWorkspaceController),
);

router.get(
  "/workspaces/:workspaceId/notifications",
  authMiddleware,
  asyncHandler(getNotificationsController),
);

router.patch(
  "/notifications/:notificationId/read",
  authMiddleware,
  asyncHandler(markAsReadController),
);

router.patch(
  "/workspaces/:workspaceId/notifications/read-all",
  authMiddleware,
  asyncHandler(markAllAsReadController),
);

router.delete(
  "/workspaces/:workspaceId/notifications/delete",
  authMiddleware,
  asyncHandler(clearAllNotificationsController),
);

router.get(
  "/workspaces/:workspaceId/notifications/unread-count",
  authMiddleware,
  asyncHandler(getUnreadNotificationCountController),
);

export default router;