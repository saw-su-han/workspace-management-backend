import express, { NextFunction } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { createCommentController, deleteCommentController, getCommentsController, updateCommentController } from "./comment.controller.js";
import { asyncHandler } from "../../../errors/asyncHandler.js";

const router = express.Router();
router.post("/comments", authMiddleware, asyncHandler(createCommentController));
router.get("/workspaces/:workspaceId/tasks/:taskId/comments", authMiddleware, asyncHandler(getCommentsController));

router.patch(
    "/workspaces/:workspaceId/tasks/:taskId/comments/:commentId", authMiddleware,
    updateCommentController
);

router.delete(
    "/workspaces/:workspaceId/tasks/:taskId/comments/:commentId", authMiddleware,
    deleteCommentController
);


export default router;


