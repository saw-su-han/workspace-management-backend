import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { getActivityLogsController } from "./activityLog.controller";

const router = express.Router();

// Get workspace activity logs
router.get(
  "/workspaces/:workspaceId/activity-logs",
  authMiddleware,
  getActivityLogsController,
);

export default router;
