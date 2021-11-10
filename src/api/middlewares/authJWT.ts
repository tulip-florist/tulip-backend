import { Response, NextFunction } from "express";
import {
  checkExpirationStatus,
  jwtAlgorithm,
  signUserToken,
} from "../logic/auth";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../../types/types";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const unauthorized = (message: string) => {
    res.status(401).json({
      message: message,
    });
  };

  const requestHeader = "X-JWT-Token";
  const responseHeader = "X-Renewed-JWT-Token";
  const token = req.header(requestHeader);

  if (!token) {
    unauthorized(`Required ${requestHeader} header not found.`);
    return;
  }
  if (!process.env.JWT_SECRET) {
    unauthorized("Server error");
    res.sendStatus(500);
    throw new Error("Server error");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [jwtAlgorithm],
    }) as JwtPayload;

    const userId = decoded.id;
    const expiration = checkExpirationStatus(decoded);

    if (expiration === "expired") {
      unauthorized("Auth token expired");
      return;
    }

    if (expiration === "renew") {
      const token = signUserToken(userId);
      res.setHeader(responseHeader, token);
    }

    req.user = userId;
    next();
  } catch (e) {
    unauthorized(
      "Failed to decode or validate auth token. Reason:" + (e as Error).message
    );
    return;
  }
};
