import { Request, Response } from "express";
import { signupWithInvitation } from "./auth.service.js";

export const signupInvitationController = async (req: any, res: any) => {
  try {
    const result = await signupWithInvitation(
      { ...req.body, token: req.params.token },
      req.files
    );
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};