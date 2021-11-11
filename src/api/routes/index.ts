import express, { Request, Response } from "express";
import { AuthRequest } from "../../types/types";
import { authenticate } from "../middlewares/authJWT";
import authRouter from "./auth";
import documentRouter from "./document";

const indexRouter = express.Router();

indexRouter.use("/auth", authRouter);
indexRouter.use("/document", authenticate, documentRouter);

// TEST ENDPOINTS:
indexRouter.get("/", (req: Request, res: Response) => {
  res.sendStatus(200);
});
indexRouter.get(
  "/protected",
  authenticate,
  (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.sendStatus(403);
    } else {
      res.sendStatus(200);
    }
  }
);

export default indexRouter;
