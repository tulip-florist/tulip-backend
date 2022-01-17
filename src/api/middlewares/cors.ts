import { Response, NextFunction, Request } from "express";

let allowedOrigins = ["https://www.tulip.florist", "https://tulip.florist"];
if (process.env.NODE_ENV != "production") {
  allowedOrigins = [...allowedOrigins, "http://localhost:3000"];
}

export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.headers.origin as string;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT,DELETE");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    // Preflight requests
    res.sendStatus(200);
  } else {
    next();
  }
};
