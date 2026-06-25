import { getDashboardService } from "./dashboard.service";

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
