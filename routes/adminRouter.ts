import express from "express";
const router = express.Router();
import {
  getAllUsers,
  getUserData,
  getUserTransactions,
  verifyUserTransactions,
} from "../controllers/adminController";

/* Get all users */
router.get("/users", getAllUsers);

/* Get all data of a user */
router.get("/users/:phone_no", getUserData);

/* Verify if user transactions are valid */
router.get("/verify_transactions/:phone_no", verifyUserTransactions);

/* Get transactions */
router.get("/transactions/:phone_no", getUserTransactions);

export default router;
