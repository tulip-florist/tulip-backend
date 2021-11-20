import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import indexRouter from "./api/routes";
import { corsMiddleware } from "./api/middlewares/cors";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app: Express = express();

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use(corsMiddleware);
app.use("/v1/", indexRouter);

app.listen(PORT, () => console.log(`Running on ${PORT}`));
