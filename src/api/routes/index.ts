import express, { Request, Response } from "express";
import { AuthRequest } from "../../types/types";
import { authenticate } from "../middlewares/authJWT";
import authRouter from "./auth";
import documentRouter from "./document";

const indexRouter = express.Router();

indexRouter.use("/auth", authRouter);
indexRouter.use("/documents", authenticate, documentRouter);
indexRouter.get("/health", (req, res) => {
  res.sendStatus(200);
});

export default indexRouter;
