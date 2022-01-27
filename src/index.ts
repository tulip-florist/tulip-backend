require("dotenv").config();
import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import logger from "./util/logger";
import httpLogger from "./util/httpLogger";
import helmet from "helmet";
import indexRouter from "./api/routes";
import { corsMiddleware } from "./api/middlewares/cors";
import { CustomError } from "./errors/CustomError";
import { errorHandler } from "./api/middlewares/errorHandler";
import { connectDB } from "./api/database/database";
const mongoSanitize = require("express-mongo-sanitize");

const PORT = process.env.PORT || 8080;
const app: Express = express();

connectDB();

app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "300kb" }));
app.use(express.json({ limit: "300kb" }));
app.use(httpLogger);

app.use(corsMiddleware);
app.use(mongoSanitize());
app.use("/v1/", indexRouter);
app.use(errorHandler);

app.listen(PORT, () => logger.info(`Running on ${PORT}`));

process.on("unhandledRejection", (reason: Error, promise: Promise<any>) => {
  throw reason;
});

process.on("uncaughtException", (error: Error) => {
  logger.error(error);
  if (!(error instanceof CustomError)) {
    process.exit(1);
  }
});
