import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import tasksRoutes from "./modules/workspace/tasks/tasks.routes";
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./errors/errorHandler";
import { AppError } from "./errors/AppError";
import invitationRoutes from "./modules/workspace/invitation/invitation.routes";
import projectRoutes from "./modules/workspace/projects/project.route";
import dashboardRoutes from "./modules/workspace/dashboard/dashboard.route";
import commentRoutes from "./modules/workspace/comments/comment.routes";
import activityLogRoutes from "./modules/workspace/activityLog/activityLog.routes";
import notificationRoutes from "./modules/workspace/notifications/notification.routes";
import workspaceRoutes from "./modules/workspace/workspace/workspace.routes";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/invitations", invitationRoutes);
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   }),
// );

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running" });
});
app.use("/auth", authRoutes);
app.use("/api/workspaces", projectRoutes);
app.use("/api", tasksRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", commentRoutes);
app.use("/api", activityLogRoutes);
app.use("/api", notificationRoutes);
app.use("/api", workspaceRoutes);
app.use(errorHandler);
export default app;
