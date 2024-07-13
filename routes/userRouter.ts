import express from "express";
const router = express.Router();
import { isAuthenticated } from "../middleware/authMiddleware";
import reqBodyValidation from "../middleware/requestBodyValidation";
import { paymentSchema } from "../utils/reqBodySchemas";
import {
  getUserBalance,
  payUser,
  getUserTransactions,
} from "../controllers/userController";

/* Get user balance */
router.get("/balance", isAuthenticated, getUserBalance);

/* Pay another user with their phone_no */
router.post("/pay", isAuthenticated, reqBodyValidation(paymentSchema), payUser);

/* Get user transactions */
router.get("/transactions", isAuthenticated, getUserTransactions);

export default router;
