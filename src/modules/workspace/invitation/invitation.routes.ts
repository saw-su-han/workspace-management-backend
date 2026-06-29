import express from "express";
import { inviteUserController } from "./invitaiton.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { acceptInvitationController } from "./acceptInvitation.controller";
import { asyncHandler } from "../../../errors/asyncHandler";
import { upload } from "../../../middleware/upload.middleware";
import { signupInvitationController } from "../../auth/signupInvitation.controller";
import { getWorkSpaceMemberService } from "./invitation.services";
import { getWorkspaceMembersController } from "./getMembers.controller";
import { updateMemberRoleController } from "./updateMemberRole.controller";
import ro from "zod/v4/locales/ro.js";
import { removeMemberController } from "./removeMember.controller";

const router = express.Router();

router.post("/invite", authMiddleware, asyncHandler(inviteUserController));
router.get("/accept/:token", asyncHandler(acceptInvitationController));
router.get(
  "/workspaces/:workspaceId/members",
  authMiddleware,
  asyncHandler(getWorkspaceMembersController),
);
router.patch(
  "/members/roles",
  authMiddleware,
  asyncHandler(updateMemberRoleController),
);
router.delete("/members", authMiddleware, asyncHandler(removeMemberController));
export default router;
