import express from "express";
import { inviteUserController } from "./invitaiton.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { acceptInvitationController } from "./acceptInvitation.controller";
import { asyncHandler } from "../../../errors/asyncHandler";
import { upload } from "../../../middleware/upload.middleware";
import { signupInvitationController } from "../../auth/signupInvitation.controller";
import { getWorkSpaceMemberService } from "./invitation.services";
import { getWorkSpaceMembersController } from "./getMembers.controller";

const router = express.Router();

router.post("/invite", authMiddleware, inviteUserController);
router.get("/accept/:token", acceptInvitationController);
router.get(
  "/members",
  authMiddleware,
  asyncHandler(getWorkSpaceMembersController),
);
export default router;
