import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { getActivityLogsController } from "./activityLog.controller";
import { asyncHandler } from "../../../errors/asyncHandler";

const router = express.Router();

// Get workspace activity logs
router.get(
  "/workspaces/:workspaceId/activity-logs",
  authMiddleware,
  asyncHandler(getActivityLogsController),
);

export default router;
