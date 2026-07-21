import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { getActivityLogsController } from "./activityLog.controller.js";
import { asyncHandler } from "../../../errors/asyncHandler.js";

const router = express.Router();

// Get workspace activity logs
router.get(
  "/workspaces/:workspaceId/activity-logs",
  authMiddleware,
  asyncHandler(getActivityLogsController),
);

export default router;
