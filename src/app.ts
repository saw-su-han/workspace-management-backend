import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./errors/errorHandler";
import invitationRoutes from "./modules/workspace/invitation/invitation.routes";

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

app.use(errorHandler);

export default app;
