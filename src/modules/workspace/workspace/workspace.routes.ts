import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import {
  createWorkspaceController,
  deleteWorkspaceController,
  getWorkSpaceDetailsController,
  updateWorkspaceController,
} from "./workspace.controller";
import { upload } from "../../../middleware/upload.middleware";
import { asyncHandler } from "../../../errors/asyncHandler";

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
export default router;
