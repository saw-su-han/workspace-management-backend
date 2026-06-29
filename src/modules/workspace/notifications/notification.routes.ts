import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import {
  createNotificationController,
  getNotificationsController,
  markAsReadController,
} from "./notification.controller";
import { upload } from "../../../middleware/upload.middleware";
import { createWorkspaceController } from "../workspace/workspace.controller";
import { asyncHandler } from "../../../errors/asyncHandler";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  upload.single("logo"),
  asyncHandler(createWorkspaceController),
);

router.post(
  "/workspaces/:workspaceId/notifications",
  authMiddleware,
  asyncHandler(createNotificationController),
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

export default router;
