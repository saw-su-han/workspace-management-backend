import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import tasksRoutes from "./modules/workspace/tasks/tasks.routes";
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./errors/errorHandler";
import invitationRoutes from "./modules/workspace/invitation/invitation.routes";
import projectRoutes from "./modules/workspace/projects/project.route";
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
app.use(errorHandler);

export default app;
