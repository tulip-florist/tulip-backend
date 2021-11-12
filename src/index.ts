import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import indexRouter from "./api/routes";

dotenv.config();

let allowedOrigins = ["https://www.tulip.florist"];
if (process.env.NODE_ENV != "production") {
  allowedOrigins = [...allowedOrigins, "http://localhost:3000"];
}
const corsOptions = {
  origin: allowedOrigins,
  exposedHeaders: "Authorization",
};

const PORT = process.env.PORT || 8080;
const app: Express = express();

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/v1/", cors(corsOptions), indexRouter);

app.listen(PORT, () => console.log(`Running on ${PORT}`));
