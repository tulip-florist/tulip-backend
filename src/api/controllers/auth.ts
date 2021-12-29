import {
  createEmailUser,
  getUserByAuthtoken,
  signEmailUserIn,
} from "../logic/auth";
import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../types/types";
import { CustomError } from "../../errors/CustomError";

export const emailSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO validation
  try {
    await createEmailUser(req.body.email, req.body.password);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

export const emailSignin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO validation
  try {
    const session = await signEmailUserIn(req.body.email, req.body.password);
    res.setHeader("Authorization", session.accessToken); // TODO refactor to use: "Bearer <token>"
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

// Retrieve user information about the current user
export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw new CustomError("Authorization header missing", 400, false);
    }

    const user = await getUserByAuthtoken(token);
    res.status(200).send({
      user,
    });
  } catch (error) {
    next(error);
  }
};
