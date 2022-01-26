import { Response, NextFunction } from "express";
import { jwtAlgorithm } from "../services/auth";
import jwt from "jsonwebtoken";
import { AccessTokenPayload, AuthRequest, Tokens } from "../../types/types";
import {
  AccessTokenExpiredError,
  AccessTokenInvalidError,
  AccessTokenMissingError,
} from "../../errors/authErrors";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies[Tokens.ACCESS_TOKEN];

  if (!accessToken) {
    return next(new AccessTokenMissingError());
  }

  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT secret env variable missing."));
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET, {
      algorithms: [jwtAlgorithm],
    }) as AccessTokenPayload;

    req.userId = decoded.userId;
    next();
  } catch (err) {
    const error = err as Error;
    if (error.name == "JsonWebTokenError") {
      return next(new AccessTokenInvalidError());
    } else if (error.name === "TokenExpiredError") {
      return next(new AccessTokenExpiredError());
    }
    next(err);
  }
};
