import express from "express";
import {
  assignProjectController,
  createProjectController,
  deleteProjectController,
  //getProjectController,
  getProjectDetailsController,
  getProjectsQueryController,
  updateProjectController,
} from "./project.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { createProjectSchema } from "./createproject.schema";
import { validate } from "../../../middleware/vilidate.middleware";
import { asyncHandler } from "../../../errors/asyncHandler";

const router = express.Router();

router.post("/projects", authMiddleware, createProjectController);

//router.get("/workspaces/:workspaceId/", authMiddleware, getProjectController);

router.get(
  "/workspaces/:workspaceId/projects/:projectId",
  authMiddleware,
  asyncHandler(getProjectDetailsController),
);
router.post("/members", authMiddleware, asyncHandler(assignProjectController));
router.patch(
  "/projects/:projectId",
  authMiddleware,
  asyncHandler(updateProjectController),
);

router.delete(
  "/:workspaceId/projects/:projectId",
  authMiddleware,
  asyncHandler(deleteProjectController),
);

router.get(
  "/projects",
  authMiddleware,
  asyncHandler(getProjectsQueryController),
);
export default router;
