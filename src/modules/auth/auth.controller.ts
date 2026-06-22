import * as authService from "./auth.service";
import { Request, Response, NextFunction } from "express";

import { RegisterFiles } from "./auth.types";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.register(
      req.body,
      req.files as RegisterFiles,
    );

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body);

    const { token, refreshToken } = result.data;

    return res.status(200).json({
      success: true,
      message: result.message,
      user: result.data.user,
      token,
      refreshToken,
    });
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const result = await authService.refreshTokenService(refreshToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      token: result.data.token,
    });
  } catch (err: any) {
    return res.status(403).json({
      success: false,
      message: err.message || "Invalid or expired refresh token",
    });
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("REQ USER:", req.user); // DEBUG

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no user found",
      });
    }

    const userId = Number(req.user.userId);

    await authService.logoutService(userId);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err: any) {
    console.log("LOGOUT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.user?.userId);

    const result = await authService.getProfileService(userId);

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.user?.userId);

    const result = await authService.updateProfileService(
      userId,
      req.body,
      req.files as RegisterFiles,
    );

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
