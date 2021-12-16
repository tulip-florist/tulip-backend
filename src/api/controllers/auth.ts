import {
  createEmailUser,
  getUserByAuthtoken,
  signEmailUserIn,
} from "../logic/auth";
import { Request, Response } from "express";
import { AuthRequest } from "../../types/types";
import logger from "../../util/logger";

export const emailSignup = async (req: Request, res: Response) => {
  try {
    // TODO validation
    const user = await createEmailUser(req.body.email, req.body.password);
    if (user) {
      res.sendStatus(201);
    } else {
      res.status(409).send({ error: "Email already registered" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      message: (error as Error).message,
    });
  }
};

export const emailSignin = async (req: Request, res: Response) => {
  // TODO validation
  try {
    const session = await signEmailUserIn(req.body.email, req.body.password);
    res.setHeader("Authorization", session.accessToken);
    res.status(200).send({
      userId: session.userId,
    });
  } catch (error) {
    logger.error(error);
    res.status(401).send({
      accessToken: null,
      message: (error as Error).message,
    });
  }
};

// Retrieve user information about the current user
export const me = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization;
    if (!token) throw new Error("Authorization header missing");

    const user = await getUserByAuthtoken(token);
    res.status(200).send({
      user,
    });
  } catch (error) {
    logger.error(error);
    res.status(401).send({
      accessToken: null,
      message: (error as Error).message,
    });
  }
};
