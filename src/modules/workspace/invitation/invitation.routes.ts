import express from "express";
import { inviteUserController } from "./invitaiton.controller.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { acceptInvitationController } from "./acceptInvitation.controller.js";
import { asyncHandler } from "../../../errors/asyncHandler.js";
import { upload } from "../../../middleware/upload.middleware.js";
import { signupInvitationController } from "../../auth/signupInvitation.controller.js";
import { getWorkSpaceMemberService } from "./invitation.services.js";
import { getWorkspaceMembersController } from "./getMembers.controller.js";
import { updateMemberRoleController } from "./updateMemberRole.controller.js";
import ro from "zod/v4/locales/ro.js";
import { removeMemberController } from "./removeMember.controller.js";

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
