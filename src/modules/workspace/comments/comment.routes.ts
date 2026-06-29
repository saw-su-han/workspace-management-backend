import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { createCommentController } from "./comment.controller";
import { asyncHandler } from "../../../errors/asyncHandler";

const router = express.Router();
router.post("/comments", authMiddleware, asyncHandler(createCommentController));
export default router;
