import { inviteUserService } from "./invitation.services";

export const inviteUserController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.headers["x-workspace-id"]);
    const invitedById = Number(req.user.userId);

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace ID is required",
      });
    }

    const result = await inviteUserService(workspaceId, invitedById, req.body);

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data: result,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};
