import { Request, Response } from "express";
import { createCommentService } from "./comment.service";

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
