import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export const authMiddleware = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    req.user = decoded;

    next();
  } catch (err: any) {
    console.log("JWT ERROR:", err.message);

    if (err instanceof TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expired, please login again",
      });
    }

    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token, you provided wrong token",
      });
    }
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

export const getProfileMiddleware = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    req.user = decoded;

    next();
  } catch (err: any) {
    console.log("JWT ERROR:", err.message);

    if (err instanceof TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expired, please login again",
      });
    }

    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token, you provided wrong token",
      });
    }
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};
