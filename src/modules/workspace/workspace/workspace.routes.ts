import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import {
  createWorkspaceController,
  deleteWorkspaceController,
  getWorkSpaceDetailsController,
  getWorkspaceInfoController,
  updateWorkspaceController,
} from "./workspace.controller.js";
import { upload } from "../../../middleware/upload.middleware.js";
import { asyncHandler } from "../../../errors/asyncHandler.js";

const router = express.Router();
router.post(
  "/create",
  authMiddleware,
  upload.single("logo"),
  asyncHandler(createWorkspaceController),
);
router.get(
  "/workspaces/:workspaceId",
  authMiddleware,
  asyncHandler(getWorkSpaceDetailsController),
);
router.patch(
  "/workspaces/:workspaceId",
  authMiddleware,
  upload.single("logo"),
  asyncHandler(updateWorkspaceController),
);

router.delete(
  "/workspaces/:workspaceId",
  authMiddleware,
  asyncHandler(deleteWorkspaceController),
);

router.get("/workspaces/:workspaceId/info", authMiddleware, getWorkspaceInfoController);
export default router;
