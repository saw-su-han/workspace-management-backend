import * as authService from "./auth.service.js";
import { Request, Response, NextFunction } from "express";
import { RegisterFiles } from "./auth.types.js";
import { changePasswordSchema, resetPasswordSchema, verifyResetCodeSchema } from "./auth.schema.js";
import AppError from "../../errors/AppError.js";

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
    // CRITICAL: Temporarily add this line to bypass your logger 
    // and read the native system/Prisma trace directly in the terminal:
    console.error("--- THE REAL ERROR IS HERE ---", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
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

    // 🔥 CRITICAL FIX: Fetch the complete mapped user schema (with workspaces and avatars) right here!
    const fullUserProfile = await authService.getProfileService(result.data.user.id);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: fullUserProfile,
        token,
        refreshToken
      }
    });
  } catch (err: any) {
    return res.status(err.statusCode || 401).json({
      success: false,
      message: err.message,
    });
  }
};

export const verifyEmailController = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const result = await authService.verifyEmail(email, code);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}; export const refreshTokenController = async (
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
    return res.status(err.statusCode || 403).json({
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
    console.error("LOGOUT ERROR:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getProfileController = async (req: any, res: any) => {
  try {
    const result = await authService.getProfileService(req.user.userId);
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

export const updateProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.user?.userId);

    if (isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized or invalid user session",
      });
    }

    // Safely parse multipart parameters (handling "null", "undefined", or empty strings)
    const parseParam = (val: any) => {
      if (!val || val === "null" || val === "undefined") return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    const workspaceId = parseParam(req.body.workspaceId);
    const projectId = parseParam(req.body.projectId);

    const result = await authService.updateProfileService(
      userId,
      workspaceId,
      projectId,
      req.body,
      req.files as RegisterFiles,
    );

    // Double wrap 'data' to perfectly align with what your frontend expects: res.data.data
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err: any) {
    console.error("UPDATE PROFILE ERROR:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const forgotPasswordController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      })
    }
    const result = await authService.forgotPassword(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    })
  }
}



export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = "Invalid input.";
      throw new AppError(firstError, 400);
    }

    const { email, code, newPassword } = parsed.data;

    const result = await authService.resetPassword({ email, code, newPassword });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// interface AuthenticatedRequest extends Request {
//   user?: { userId: number; workspaceId: number; role: string };
// }

export const changePassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const result = await authService.changePasswordService(userId!, currentPassword, newPassword);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const verifyResetCodeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = verifyResetCodeSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError("Invalid input.", 400);
    }

    const { email, code } = parsed.data;
    const result = await authService.verifyResetCodeService(email, code);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};