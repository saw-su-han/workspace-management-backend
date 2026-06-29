import {
  assignTaskService,
  createTaskService,
  deleteTaskService,
  // getAllTasks,
  getTaskDetailsService,
  getTasksQueryService,
  updateTaskService,
  updateTaskStatusService,
} from "./tasks.service";

export const createTaskController = async (req: any, res: any) => {
  const userId = req.user.userId;

  const task = await createTaskService(userId, req.body);

  res.json({
    success: true,
    data: task,
  });
};

export const assignTaskController = async (req: any, res: any) => {
  const userId = req.user.userId;
  const workspaceId = Number(req.params.workspaceId);
  const taskId = Number(req.params.taskId);
  const { assignedTo } = req.body;

  const task = await assignTaskService(userId, workspaceId, taskId, assignedTo);

  res.json({
    success: true,
    data: task,
  });
};

// export const getTasksController = async (req: any, res: any) => {
//   try {
//     const userId = req.user.userId;

//     const workspaceId = Number(req.params.workspaceId);
//     const projectId = req.query.projectId
//       ? Number(req.query.projectId)
//       : undefined;

//     if (isNaN(workspaceId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid workspaceId",
//       });
//     }

//     const tasks = await getAllTasks(userId, workspaceId, projectId);

//     return res.status(200).json({
//       success: true,
//       data: tasks,
//     });
//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
export const getTasksQueryController = async (req: any, res: any) => {
  try {
    const workspaceId = req.user.workspaceId;

    if (isNaN(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspaceId",
      });
    }

    const userId = req.user.userId;

    // query
    const { search, status, assignedTo, projectId } = req.query;

    const result = await getTasksQueryService(
      userId,
      workspaceId,
      search,
      status,
      assignedTo ? Number(assignedTo) : undefined,
      projectId ? Number(projectId) : undefined,
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
    // const workspaceId = req.user.workspaceId;
    const taskId = Number(req.params.taskId);

    const data = req.body;

    const result = await updateTaskService(req.user.userId, taskId, data);

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
