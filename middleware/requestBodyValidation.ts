import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export default function reqBodyValidation(schema: Joi.ObjectSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      res.status(400).send("Invalid request body");
    } else {
      req.body = value;
      next();
    }
  };
}
