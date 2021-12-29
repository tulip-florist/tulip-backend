require("dotenv").config();
import express, { Express, Request, Response } from "express";
import logger from "./util/logger";
import httpLogger from "./util/httpLogger";
import helmet from "helmet";
import indexRouter from "./api/routes";
import { corsMiddleware } from "./api/middlewares/cors";
import { CustomError } from "./errors/CustomError";
import { errorHandler } from "./api/middlewares/errorHandler";

const PORT = process.env.PORT || 8080;
const app: Express = express();

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(httpLogger);

app.use(corsMiddleware);
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
