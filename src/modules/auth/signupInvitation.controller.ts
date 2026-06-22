import { Request, Response } from "express";
import { signupWithInvitation } from "./auth.service";

export const signupInvitationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const token = req.params.token;

    const result = await signupWithInvitation(
      {
        token,
        ...req.body,
      },
      req.files as any,
    );

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
