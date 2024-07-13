import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { customError } from "../utils/customError";

dotenv.config();

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    next(new customError(401, "Authorization header missing"));
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
      if (err) {
        next(new customError(403, "Invalid JWT token"));
      } else {
        req.user = user;
        next();
      }
    });
  }
}
