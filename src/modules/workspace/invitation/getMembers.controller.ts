import { success } from "zod";
import { getWorkSpaceMemberService } from "./invitation.services";
import { Request, Response } from "express";
export const getWorkSpaceMembersController = async (
  req: any,
  res: Response,
) => {
  const workspaceId = req.user.workspaceId;
  const userId = req.user.userId;

  const members = await getWorkSpaceMemberService(workspaceId, userId);
  return res.status(200).json({
    success: true,
    data: members,
  });
};
