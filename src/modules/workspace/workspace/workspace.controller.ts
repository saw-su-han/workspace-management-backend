import { Request, Response } from "express";
import {
  createWorkspaceService,
  deleteWorkspaceService,
  getWorkSpaceDetailsService,
  getWorkspaceInfoService,
  updateWorkspaceDetailsService,
} from "./workspace.service.js";

export const createWorkspaceController = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    // 💡 Fix: Handle BOTH variations ('workspaceName' or 'name') sent by the frontend
    const workspaceName = req.body.workspaceName || req.body.name;

    // Package it explicitly into the shape the service expects
    const workspace = await createWorkspaceService(
      userId,
      { workspaceName },
      req.file
    );

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspace,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWorkSpaceDetailsController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const result = await getWorkSpaceDetailsService(workspaceId, req.user.userId);

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

    // 💡 Fix: Normalize the data structure to match the update service expectations
    const updateData = {
      name: req.body.name || req.body.workspaceName
    };

    const result = await updateWorkspaceDetailsService(
      workspaceId,
      req.user.userId,
      updateData,
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

    // 💡 Fix: Safely pass the confirm parameter from req.body
    const confirm = req.body.confirm === true || req.body.confirm === 'true';

    const result = await deleteWorkspaceService(
      workspaceId,
      req.user.userId,
      confirm, // Pass the boolean directly
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

export const getWorkspaceInfoController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const result = await getWorkspaceInfoService(workspaceId, req.user.userId);

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