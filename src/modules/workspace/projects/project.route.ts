import express from "express";
import {
  assignProjectController,
  createProjectController,
  deleteProjectController,
  getProjectController,
  getProjectDetailsController,
  updateProjectController,
} from "./project.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { createProjectSchema } from "./createproject.schema";
import { validate } from "../../../middleware/vilidate.middleware";

const router = express.Router();

router.post(
  "/:workspaceId/projects",
  authMiddleware,
  validate(createProjectSchema),
  createProjectController,
);
router.get("/:workspaceId/projects", authMiddleware, getProjectController);

router.get(
  "/:workspaceId/projects/:projectId",
  authMiddleware,
  getProjectDetailsController,
);
router.post(
  "/:workspaceId/projects/:projectId/members",
  authMiddleware,
  assignProjectController,
);
router.patch(
  "/:workspaceId/projects/:projectId",
  authMiddleware,
  updateProjectController,
);
router.delete(
  "/:workspaceId/projects/:projectId",
  authMiddleware,
  deleteProjectController,
);
export default router;
