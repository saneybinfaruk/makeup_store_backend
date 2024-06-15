import { NextFunction, Response } from "express";
import { CustomRequest } from "./auth";

const admin = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.user?.admin! === 0) return res.status(403).send("Access denied");
  next();
};

export default admin;
