import { Request, Response } from "express";
import { createCommentService } from "./comment.service";

export const createCommentController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const taskId = Number(req.params.taskId);
    const userId = req.user.userId;

    const { content } = req.body;

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
