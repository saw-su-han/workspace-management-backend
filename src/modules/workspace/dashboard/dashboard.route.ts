import express from "express";
import { getDashboardController } from "./dashboard.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { getMyDashboardController } from "./dashboard.service";
const router = express.Router();
router.get(
  "/workspaces/:workspaceId/dashboard",
  authMiddleware,
  getDashboardController,
);

router.get(
  "/workspaces/:workspaceId/my-dashboard",
  authMiddleware,
  getMyDashboardController,
);
export default router;
