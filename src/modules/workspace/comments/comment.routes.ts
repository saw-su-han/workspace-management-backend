import express, { NextFunction } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { createCommentController, deleteCommentController, getCommentsController, updateCommentController } from "./comment.controller.js";
import { asyncHandler } from "../../../errors/asyncHandler.js";

const router = express.Router();
router.post("/comments", authMiddleware, asyncHandler(createCommentController));
router.get("/workspaces/:workspaceId/tasks/:taskId/comments", authMiddleware, asyncHandler(getCommentsController));
router.put(
    "/workspaces/:workspaceId/tasks/:taskId/comments/:commentId",
    updateCommentController
);

router.delete(
    "/workspaces/:workspaceId/tasks/:taskId/comments/:commentId",
    deleteCommentController
);


export default router;


