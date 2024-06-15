import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";   
import { User } from "../entities/User";

export interface CustomRequest extends Request {
  user?: User; // Optional user data based on UserField interface
}
const auth = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided!");

  console.log('=================token===================');
  console.log(token);
  console.log('==================token==================');

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_PRIVATE_KEY as string
    ) as User;
    req.user = decoded;

    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
};

export default auth;
