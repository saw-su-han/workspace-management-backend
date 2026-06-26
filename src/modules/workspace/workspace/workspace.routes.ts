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
  createWorkspaceController,
);
router.get("/:workspaceId", authMiddleware, getWorkSpaceDetailsController);
router.patch(
  "/:workspaceId",
  authMiddleware,
  upload.single("logo"),
  asyncHandler(updateWorkspaceController),
);

router.delete("/:workspaceId", authMiddleware, deleteWorkspaceController);
export default router;
