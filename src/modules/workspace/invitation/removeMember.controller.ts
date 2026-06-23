import { Request, Response } from "express";
import { removeMemberService } from "./removeMember.service";

export const removeMemberController = async (req: any, res: Response) => {
  const workspaceId = req.user.workspaceId;
  const userId = req.user.userId;

  const { targetId } = req.body;

  const result = await removeMemberService(
    workspaceId,
    userId,
    Number(targetId),
  );

  return res.status(200).json(result);
};
