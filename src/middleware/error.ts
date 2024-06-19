import { NextFunction, Request, Response } from "express";
import logger from "../utility/loggin";

const error = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info("error", error);
  res.status(500).send(error);
};

export default error;
