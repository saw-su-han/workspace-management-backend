import express from "express";
// import { validate } from "../../middleware/vilidate.middleware";
import {
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  updateProfileController,
} from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";
import { upload } from "../../middleware/upload.middleware";
import { asyncHandler } from "../../errors/asyncHandler";
import {
  authMiddleware,
  getProfileMiddleware,
} from "../../middleware/auth.middleware";
import { signupInvitationController } from "./signupInvitation.controller";
import { getProjectDetailsController } from "../workspace/projects/project.controller";

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  asyncHandler(registerController),
);
router.post(
  "/signup/invitation/:token",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  asyncHandler(signupInvitationController),
);

router.post("/login", asyncHandler(loginController));
router.post("/refresh", asyncHandler(refreshTokenController));
router.post("/logout", authMiddleware, asyncHandler(logoutController));
router.get(
  "/getprofile",
  getProfileMiddleware,
  asyncHandler(getProfileController),
);
router.patch(
  "/profile",
  authMiddleware,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  asyncHandler(updateProfileController),
);
router.get(
  "/:workspaceId/projects/:projectId",
  authMiddleware,
  asyncHandler(getProjectDetailsController),
);
export default router;
