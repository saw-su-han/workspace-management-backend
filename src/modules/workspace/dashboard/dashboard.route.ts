import express from "express";
import {
  getDashboardController,
  getDetailsDashboardController,
} from "./dashboard.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../errors/asyncHandler";
const router = express.Router();
router.get(
  "/workspaces/:workspaceId/dashboard",
  authMiddleware,
  asyncHandler(getDashboardController),
);

router.get(
  "/workspaces/:workspaceId/dashboard-details",
  authMiddleware,
  getDetailsDashboardController,
);
export default router;
