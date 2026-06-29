import express from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import {
  assignTaskController,
  createTaskController,
  deleteTaskController,
  getTaskDetailsController,
  //getTasksController,
  getTasksQueryController,
  updateTaskController,
  updateTaskStatusController,
} from "./tasks.controller";
import { updateTaskSchema } from "./tasks.schema";
import { validate } from "../../../middleware/vilidate.middleware";
import { asyncHandler } from "../../../errors/asyncHandler";

const router = express.Router();

router.post("/tasks", authMiddleware, createTaskController);

router.patch(
  "/workspaces/:workspaceId/tasks/:taskId/assign",
  authMiddleware,
  asyncHandler(assignTaskController),
);

// router.get(
//   "/workspaces/:workspaceId/tasks",
//   authMiddleware,
//   getTasksController,
// );

router.get("/tasks", authMiddleware, asyncHandler(getTasksQueryController));

router.get(
  "/workspaces/:workspaceId/tasks/:taskId",
  authMiddleware,
  asyncHandler(getTaskDetailsController),
);

router.patch(
  "/tasks/:taskId",
  authMiddleware,
  validate(updateTaskSchema),
  asyncHandler(updateTaskController),
);

router.patch(
  "/workspaces/:workspaceId/tasks/:taskId/status",
  authMiddleware,
  asyncHandler(updateTaskStatusController),
);

router.delete(
  "/workspaces/:workspaceId/tasks/:taskId",
  authMiddleware,
  asyncHandler(deleteTaskController),
);
export default router;
