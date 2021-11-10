import express, { Request, Response } from "express";
import { AuthRequest } from "../../types/types";
import { authenticate } from "../middlewares/authJWT";
import authRouter from "./auth";

const indexRouter = express.Router();

indexRouter.use("/auth", authRouter);

// TEST ENDPOINTS:
indexRouter.get("/", (req: Request, res: Response) => {
  res.sendStatus(200);
});
indexRouter.get(
  "/protected",
  authenticate,
  (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.sendStatus(403);
    } else {
      res.sendStatus(200);
    }
  }
);

export default indexRouter;
