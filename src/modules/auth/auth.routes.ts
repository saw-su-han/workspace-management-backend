import express from "express";
import multer from "multer"; // 1. CRITICAL: Added this import to prevent the ReferenceError
import {
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  updateProfileController,
} from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { upload } from "../../middleware/upload.middleware.js";
import { asyncHandler } from "../../errors/asyncHandler.js";
import {
  authMiddleware,
  getProfileMiddleware,
} from "../../middleware/auth.middleware.js";
import { signupInvitationController } from "./signupInvitation.controller.js";
import { getProjectDetailsHandler } from "../workspace/projects/project.controller.js";

const router = express.Router();

router.post("/register", (req, res, next) => {
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "avatar", maxCount: 1 }
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer-Specific Error:", err.message);
      return res.status(400).json({
        success: false,
        message: `Upload limit/field error: ${err.message}`
      });
    }

    if (err) {
      console.error("Cloudinary/Network Upload Error:", err);
      return res.status(500).json({
        success: false,
        message: `Cloud storage upload failed: ${err.message}`
      });
    }

    next();
  });
}, asyncHandler(registerController));

router.get("/testing", (req, res) => {
  res.status(200).json({ message: "Auth route testing" })
});

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
  asyncHandler(getProjectDetailsHandler),
);

export default router;