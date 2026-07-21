import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import tasksRoutes from "./modules/workspace/tasks/tasks.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./errors/errorHandler.js";
import { AppError } from "./errors/AppError.js";
import invitationRoutes from "./modules/workspace/invitation/invitation.routes.js";
import projectRoutes from "./modules/workspace/projects/project.route.js";
import dashboardRoutes from "./modules/workspace/dashboard/dashboard.route.js";
import commentRoutes from "./modules/workspace/comments/comment.routes.js";
import activityLogRoutes from "./modules/workspace/activityLog/activityLog.routes.js";
import notificationRoutes from "./modules/workspace/notifications/notification.routes.js";
import workspaceRoutes from "./modules/workspace/workspace/workspace.routes.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://172.17.5.11:5173", // replace with your actual hostname -I output
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-workspace-id"],
  }),
);
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running" });
});
app.use("/api/auth", authRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api", projectRoutes);
app.use("/api", tasksRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", commentRoutes);
app.use("/api", activityLogRoutes);
app.use("/api", notificationRoutes);
app.use("/api", workspaceRoutes);
app.use(errorHandler);
export default app;
