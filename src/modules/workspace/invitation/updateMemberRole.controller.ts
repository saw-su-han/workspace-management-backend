import { updateMemberRoleService } from "./invitation.services";
import { Request, Response } from "express";
export const updateMemberRoleController = async (req: any, res: Response) => {
  const workspaceId = req.user.workspaceId;
  const ownerId = req.user.userId;

  const { targetId, role } = req.body;

  const result = await updateMemberRoleService(
    workspaceId,
    ownerId,
    targetId,
    role,
  );

  return res.status(200).json({
    success: true,
    message: "Member role updated successfully",
    data: result,
  });
};
