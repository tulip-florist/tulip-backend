import { createEmailUser, signEmailUserIn } from "../logic/auth";
import { Request, Response } from "express";

export const emailSignup = async (req: Request, res: Response) => {
  try {
    // TODO validation
    await createEmailUser(req.body.email, req.body.password);
    res.sendStatus(201);
  } catch (error) {
    console.log((error as Error).message);
    res.status(500).send({
      message: (error as Error).message,
    });
  }
};

export const emailSignin = async (req: Request, res: Response) => {
  // TODO validation
  try {
    const session = await signEmailUserIn(req.body.email, req.body.password);
    res.status(200).send(session);
  } catch (error) {
    console.log((error as Error).message);
    res.status(401).send({
      accessToken: null,
      message: (error as Error).message,
    });
  }
};
