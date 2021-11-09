import { Request, Response } from "express";
import { createUser as createUserInDb } from "../logic/user";

export async function createUser(req: Request, res: Response) {
  const createdUser = await createUserInDb();
  res.json(createdUser);
}
