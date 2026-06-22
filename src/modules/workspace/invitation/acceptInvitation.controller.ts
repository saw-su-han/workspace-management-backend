import { Request, Response } from "express";
import { acceptInvitationService } from "./invitation.services";

export const acceptInvitationController = async (req: any, res: Response) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token provided",
      });
    }

    const result = await acceptInvitationService(token);

    if ("needsSignup" in result) {
      return res.status(200).json({
        success: false,
        message: "User must signup first",
        redirect: result.redirect,
        email: result.email,
        token: result.token,
      });
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
