import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { createCommentController } from "./comment.controller.js";
import { asyncHandler } from "../../../errors/asyncHandler.js";

const router = express.Router();
router.post("/comments", authMiddleware, asyncHandler(createCommentController));
export default router;
