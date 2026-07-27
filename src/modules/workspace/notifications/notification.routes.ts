import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import {
  clearAllNotificationsController,
  getNotificationsController,
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

router.post(
  "/workspaces/:workspaceId/notifications",
  authMiddleware,
  asyncHandler(getNotificationsController),
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
router.patch("/workspaces/:workspaceId/notifications/read-all", authMiddleware, markAllAsReadController);

router.delete("/workspaces/:workspaceId/notifications/delete", authMiddleware, clearAllNotificationsController);


export default router;
