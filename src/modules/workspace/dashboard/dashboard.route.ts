import express from "express";
import {
  getDashboardController,
  getDetailsDashboardController,
} from "./dashboard.controller.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { asyncHandler } from "../../../errors/asyncHandler.js";
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
