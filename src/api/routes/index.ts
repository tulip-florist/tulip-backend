import express, { Request, request, Response } from "express";
import userRouter from "./user";
const indexRouter = express.Router();

indexRouter.use("/user", userRouter);
indexRouter.get("/", (req: Request, res: Response) => {
  // TEST ENDPOINT
  res.sendStatus(200);
});

export default indexRouter;
