import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        workspaceId: number;
        role: string;
      };
    }
  }
}

export {};
