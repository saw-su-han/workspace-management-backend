import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { createCommentController } from "./comment.controller";

const router = express.Router();
router.post(
  "/workspaces/:workspaceId/tasks/:taskId/comments",
  authMiddleware,
  createCommentController,
);
export default router;
