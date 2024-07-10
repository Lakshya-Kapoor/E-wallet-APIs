import Joi from "joi";

export const signUpSchema = Joi.object({
  name: Joi.string().max(50).required(),
  phone_no: Joi.number()
    .min(1e9)
    .max(1e10 - 1)
    .required(),
  password: Joi.string().required(),
});

export const logInSchema = Joi.object({
  phone_no: Joi.number()
    .min(1e9)
    .max(1e10 - 1)
    .required(),
  password: Joi.string().required(),
});

export const paymentSchema = Joi.object({
  amount: Joi.number().required(),
  receiver_phone_no: Joi.number()
    .min(1e9)
    .max(1e10 - 1)
    .required(),
});
