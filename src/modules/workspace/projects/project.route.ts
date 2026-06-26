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

router.post("/projects", authMiddleware, createProjectController);
router.get(
  "/workspaces/:workspaceId/projects",
  authMiddleware,
  getProjectController,
);

router.get(
  "/workspaces/:workspaceId/projects/:projectId",
  authMiddleware,
  getProjectDetailsController,
);
router.post(
  "/workspaces/:workspaceId/projects/:projectId/members",
  authMiddleware,
  assignProjectController,
);
router.patch("/projects/:projectId", authMiddleware, updateProjectController);
router.delete(
  "/:workspaceId/projects/:projectId",
  authMiddleware,
  deleteProjectController,
);
export default router;
