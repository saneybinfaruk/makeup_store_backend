// corsMiddleware.ts
import { NextFunction, Request, Response } from "express";

const cors = (allowedOrigins: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin as string;

    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
    } else {
      next();
    }
  };
};

export default cors;
