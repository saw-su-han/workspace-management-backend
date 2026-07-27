import { NextFunction, Request, Response } from "express";
import { createCommentService } from "./comment.service.js";
import { deleteCommentService, getCommentsService, updateCommentService } from "./getcomment.service.js";
import AppError from "../../../errors/AppError.js";

export const createCommentController = async (req: any, res: any) => {
  try {
    const { workspaceId, taskId, content } = req.body;
    const userId = req.user.userId;

    const result = await createCommentService(
      userId,
      workspaceId,
      taskId,
      content,
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getCommentsController = async (req: any, res: any) => {

  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Unauthorized user", 401);
  }

  const workspaceId = Number(req.params.workspaceId);
  const taskId = Number(req.params.taskId);

  const comments = await getCommentsService(userId, workspaceId, taskId);
  return res.json({ data: comments });
};

export const updateCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const workspaceId = Number(req.params.workspaceId);
    const taskId = Number(req.params.taskId);
    const commentId = Number(req.params.commentId);

    const { content } = req.body;

    const comment = await updateCommentService(
      userId,
      workspaceId,
      taskId,
      commentId,
      content
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const workspaceId = Number(req.params.workspaceId);
    const taskId = Number(req.params.taskId);
    const commentId = Number(req.params.commentId);

    const result = await deleteCommentService(
      userId,
      workspaceId,
      taskId,
      commentId
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

