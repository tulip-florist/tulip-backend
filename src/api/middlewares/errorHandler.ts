import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../errors/CustomError";
import logger from "../../util/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError && !err.isInternal) {
    logger.info(err);
    return res.status(err.httpStatusCode).send({ errors: err.serialize() });
  } else if (err.message === "request entity too large") {
    logger.info(err);
    return res.status(413).json({ errors: [{ message: err.message }] });
  }
  logger.error(err);
  res.status(500).send({
    errors: [{ message: "Something went wrong" }],
  });
};
