import express from "express";
const router = express.Router();
import { reqBodyValidation } from "../utils/middleware";
import { signUpSchema, logInSchema } from "../utils/reqBodySchemas";
import { signUpUser, logInUser } from "../controllers/authController";

import dotenv from "dotenv";
dotenv.config();

/* Sign up user */
router.post("/signup", reqBodyValidation(signUpSchema), signUpUser);

/* Log in user */
router.post("/login", reqBodyValidation(logInSchema), logInUser);

export default router;
