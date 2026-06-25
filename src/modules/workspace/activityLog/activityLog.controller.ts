import { Request, Response } from "express";
import { getActivityLogsService } from "./activityLog.service";

export const getActivityLogsController = async (
  req: any,
  res: Response,
  next: any,
) => {
  try {
    const workspaceId = Number(req.params.workspaceId);

    const userId = req.user.id;
    const role = req.user.role;

    const logs = await getActivityLogsService(workspaceId, userId, role);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
