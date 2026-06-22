import jwt from "jsonwebtoken";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../modules/auth/auth.types";

export const generateToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = (payload: RefreshTokenPayload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};
