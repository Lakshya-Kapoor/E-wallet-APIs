import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).send("Authorization header missing");
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
      if (err) {
        res.status(403).send("Invalid JWT token");
      } else {
        req.user = user;
        next();
      }
    });
  }
}
