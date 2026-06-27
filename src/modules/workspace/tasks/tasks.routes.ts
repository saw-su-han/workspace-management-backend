import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import {
  assignTaskController,
  createTaskController,
  deleteTaskController,
  getTaskDetailsController,
  getTasksController,
  getTasksQueryController,
  updateTaskController,
  updateTaskStatusController,
} from "./tasks.controller";
import { updateTaskSchema } from "./tasks.schema";
import { validate } from "../../../middleware/vilidate.middleware";

const router = express.Router();

router.post("/tasks", authMiddleware, createTaskController);

router.patch(
  "/workspaces/:workspaceId/tasks/:taskId/assign",
  authMiddleware,
  assignTaskController,
);

router.get(
  "/workspaces/:workspaceId/tasks",
  authMiddleware,
  getTasksController,
);

router.get("/tasks", authMiddleware, getTasksQueryController);

router.get(
  "/workspaces/:workspaceId/tasks/:taskId",
  authMiddleware,
  getTaskDetailsController,
);

router.patch(
  "/tasks/:taskId",
  authMiddleware,
  validate(updateTaskSchema),
  updateTaskController,
);

router.patch(
  "/workspaces/:workspaceId/tasks/:taskId/status",
  authMiddleware,
  updateTaskStatusController,
);

router.delete(
  "/workspaces/:workspaceId/tasks/:taskId",
  authMiddleware,
  deleteTaskController,
);
export default router;
