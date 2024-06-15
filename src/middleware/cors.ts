import { NextFunction, Request, Response } from "express";

const cors =
  (allowedOrigins: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin as string;

    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With, content-type"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Pass to next layer of middleware
    next();
  };

export default cors;
