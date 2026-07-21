import express from "express";
import {
  assignProjectController,
  createProjectController,
  deleteProjectController,
  //getProjectController,
  getProjectDetailsHandler,
  getProjectsQueryController,
  updateProjectController,
} from "./project.controller.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { createProjectSchema } from "./createproject.schema.js";
import { validate } from "../../../middleware/vilidate.middleware.js";
import { asyncHandler } from "../../../errors/asyncHandler.js";

const router = express.Router();

router.post("/projects", authMiddleware, createProjectController);

//router.get("/workspaces/:workspaceId/", authMiddleware, getProjectController);

router.get(
  "/workspaces/:workspaceId/projects/:projectId",
  authMiddleware,
  asyncHandler(getProjectDetailsHandler),
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
