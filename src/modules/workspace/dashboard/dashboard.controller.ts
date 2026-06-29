import { safeParse } from "zod";
import {
  getDashboardMemberService,
  getDashboardService,
} from "./dashboard.service";
import AppError from "../../../errors/AppError";

export const getDashboardController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);

    const result = await getDashboardService(workspaceId, req.user.userId);

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

export const getDetailsDashboardController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const userId = req.user.userId;

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search as string;

    const result = await getDashboardMemberService(
      userId,
      workspaceId,
      page,
      limit,
      search,
    );

    if (!workspaceId || isNaN(workspaceId)) {
      throw new AppError("Invalid workspaceId", 400);
    }
    return res.status(200).json({
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
