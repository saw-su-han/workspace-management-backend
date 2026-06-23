import {
  createTaskService,
  deleteTaskService,
  getTaskDetailsService,
  getTasksService,
  updateTaskService,
  updateTaskStatusService,
} from "./tasks.service";

export const createTaskController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);

    const result = await createTaskService(
      req.user.userId,
      workspaceId,
      req.body,
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getTasksController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);

    const result = await getTasksService(req.user.userId, workspaceId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTaskDetailsController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const taskId = Number(req.params.taskId);

    const result = await getTaskDetailsService(
      req.user.userId,
      workspaceId,
      taskId,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTaskController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const taskId = Number(req.params.taskId);

    const data = req.body;

    const result = await updateTaskService(
      req.user.userId,
      workspaceId,
      taskId,
      data,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTaskStatusController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const taskId = Number(req.params.taskId);
    const { status } = req.body;

    const result = await updateTaskStatusService(
      req.user.userId,
      workspaceId,
      taskId,
      status,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteTaskController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const taskId = Number(req.params.taskId);

    const result = await deleteTaskService(
      req.user.userId,
      workspaceId,
      taskId,
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
