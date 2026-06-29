import { success } from "zod";
import { getWorkSpaceMemberService } from "./invitation.services";
import { Request, Response } from "express";
export const getWorkspaceMembersController = async (req: any, res: any) => {
  const userId = req.user.userId;
  const workspaceId = Number(req.params.workspaceId);

  const members = await getWorkSpaceMemberService(workspaceId, userId);

  res.json({
    success: true,
    data: members,
  });
};
