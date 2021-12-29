import { Response, NextFunction, Request } from "express";
import {
  checkExpirationStatus,
  jwtAlgorithm,
  signUserToken,
} from "../logic/auth";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../../types/types";
import { CustomError } from "../../errors/CustomError";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = "Authorization";
  const reqAuthHeader = req.header(authHeader);

  try {
    if (!reqAuthHeader) {
      throw new CustomError(
        `Required ${authHeader} header not set.`,
        400,
        false
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret env variable missing");
    }

    const token = reqAuthHeader.split(" ")[1]; // "Bearer <token>"
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [jwtAlgorithm],
    }) as JwtPayload;

    const userId: string = decoded.id;
    const expiration = checkExpirationStatus(decoded);

    if (expiration === "expired") {
      throw new CustomError("Auth token expired", 401, false);
    }

    if (expiration === "renew") {
      const token = signUserToken(userId);
      res.setHeader(authHeader, token);
    }

    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
};
