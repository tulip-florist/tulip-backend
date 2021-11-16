import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import indexRouter from "./api/routes";

dotenv.config();

let allowedOrigins = ["https://www.tulip.florist", "https://tulip.florist"];
if (process.env.NODE_ENV != "production") {
  allowedOrigins = [...allowedOrigins, "http://localhost:3000"];
}

const PORT = process.env.PORT || 8080;
const app: Express = express();

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(function (req, res, next) {
  const origin = req.headers.origin as string;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/v1/", indexRouter);

app.listen(PORT, () => console.log(`Running on ${PORT}`));
