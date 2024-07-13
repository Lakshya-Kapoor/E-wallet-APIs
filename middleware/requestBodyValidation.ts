import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { customError } from "../utils/customError";

export default function reqBodyValidation(schema: Joi.ObjectSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      next(new customError(400, "Invalid request body"));
    } else {
      req.body = value;
      next();
    }
  };
}
