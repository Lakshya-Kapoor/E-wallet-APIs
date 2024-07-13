import express from "express";
const router = express.Router();
import { verifyUserTransactions } from "../controllers/adminController";

router.get("/verify_transactions/:phone_no", verifyUserTransactions);

export default router;
