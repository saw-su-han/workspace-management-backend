import { success } from "zod";
import {
  assignProjectService,
  createProjectService,
  deleteProjectService,
  getProjectDetailsService,
  //getProjectService,
  getProjectServiceQuery,
  updateProjectService,
} from "./project.service";

export const createProjectController = async (req: any, res: any) => {
  const workspaceId = req.user.workspaceId;

  if (isNaN(workspaceId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid workspaceId",
    });
  }

  const project = await createProjectService(
    req.user.userId,
    workspaceId,
    req.body,
  );

  return res.status(201).json({
    success: true,
    data: project,
  });
};

//
// export const getProjectController = async (req: any, res: any) => {
//   try {
//     const workspaceId = Number(req.params.workspaceId);

//     if (isNaN(workspaceId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid workspaceId",
//       });
//     }

//     const userId = req.user.userId;
//     const project = await getProjectService(userId, workspaceId);

//     return res.status(200).json({
//       success: true,
//       data: project,
//     });
//   } catch (error: any) {
//     return res.status(error.statusCode || 400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

//

export const getProjectsQueryController = async (req: any, res: any) => {
  const userId = req.user.userId;

  const workspaceId = Number(req.query.workspaceId);
  const projectId = Number(req.query.projectId);
  const { search, status } = req.query;

  const projects = await getProjectServiceQuery(
    userId,
    workspaceId,
    projectId,
    search,
    status,
  );

  res.json({
    success: true,
    data: projects,
  });
};
//

export const getProjectDetailsController = async (req: any, res: any) => {
  try {
    const workspaceId = Number(req.params.workspaceId);
    const projectId = Number(req.params.projectId);

    if (isNaN(workspaceId) || isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IDs",
      });
    }

    const project = await getProjectDetailsService(
      req.user.userId,
      workspaceId,
      projectId,
    );

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const assignProjectController = async (req: any, res: any) => {
  try {
    const requesterId = req.user.userId;
    const { workspaceId, projectId, userId } = req.body;
    const result = await assignProjectService(
      requesterId,
      workspaceId,
      projectId,
      userId,
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

export const updateProjectController = async (req: any, res: any) => {
  try {
    const workspaceId = req.body.workspaceId;
    const projectId = Number(req.params.projectId);
    const userId = req.user.userId;

    const result = await updateProjectService(
      userId,
      workspaceId,
      projectId,
      req.body,
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
export const deleteProjectController = async (req: any, res: any) => {
  const workspaceId = Number(req.params.workspaceId);
  const projectId = Number(req.params.projectId);

  const result = await deleteProjectService(
    req.user.userId,
    workspaceId,
    projectId,
    req.body.confirm,
  );

  res.status(200).json({
    success: true,
    data: result,
  });
};
