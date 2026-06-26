import { success } from "zod";
import {
  createWorkspaceService,
  deleteWorkspaceService,
  getWorkSpaceDetailsService,
  updateWorkspaceDetailsService,
} from "./workspace.service";

export const createWorkspaceController = async (req: any, res: any) => {
  const userId = req.user.userId;

  const workspace = await createWorkspaceService(userId, req.body, req.file);

  res.status(201).json({
    success: true,
    message: "Workspace created successfully",
    data: workspace,
  });
};
export const getWorkSpaceDetailsController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);

    const result = await getWorkSpaceDetailsService(
      workspaceId,
      req.user.userId,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateWorkspaceController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);

    const result = await updateWorkspaceDetailsService(
      workspaceId,
      req.user.userId,
      req.body,
      req.file,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteWorkspaceController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);

    const result = await deleteWorkspaceService(
      workspaceId,
      req.user.userId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};
