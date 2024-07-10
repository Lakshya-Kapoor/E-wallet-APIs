import express from "express";
const router = express.Router();
import db from "../config/db";
import { User, Payment } from "../types/customTypes";
import { isAuthenticated } from "../middleware/authMiddleware";
import reqBodyValidation from "../middleware/requestBodyValidation";
import { paymentSchema } from "../schemas/reqBodySchemas";

router.get("/balance", isAuthenticated, async (req, res) => {
  const { phone_no } = req.user;

  try {
    const { balance } = (
      await db.query(
        `
        SELECT balance FROM users
        JOIN wallet ON users.wallet_id = wallet.wallet_id
        WHERE phone_no = $1`,
        [phone_no]
      )
    ).rows[0];

    res.json({ balance });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

router.post(
  "/pay",
  isAuthenticated,
  reqBodyValidation(paymentSchema),
  async (req, res) => {
    const { phone_no } = req.user;
    const { amount, receiver_phone_no }: Payment = req.body;
    try {
      await db.query("BEGIN");

      /* Get sender details */
      const senderResult: User[] = (
        await db.query(
          `  
        SELECT * FROM users
        JOIN wallet ON users.wallet_id = wallet.wallet_id 
        WHERE phone_no = $1`,
          [phone_no]
        )
      ).rows;
      const sender = senderResult[0];

      /* Get receiver details*/
      const receiverResult: User[] = (
        await db.query(
          `  
        SELECT * FROM users
        JOIN wallet ON users.wallet_id = wallet.wallet_id 
        WHERE phone_no = $1`,
          [receiver_phone_no]
        )
      ).rows;
      const receiver = receiverResult[0];

      if (!receiver) {
        throw new Error("Receiver does not exist");
      }

      if (receiver.phone_no == sender.phone_no) {
        throw new Error("You can't pay yourself");
      }

      if (amount <= 0) {
        throw new Error("Amount must be positive");
      }

      if (sender.balance! < amount) {
        throw new Error("Insufficient balance");
      }

      /* Debit sender */
      await db.query(
        `
        UPDATE wallet
        SET balance = $1
        WHERE wallet_id = $2
        `,
        [sender.balance! - amount, sender.wallet_id]
      );

      /* Credit receiver */
      await db.query(
        `
        UPDATE wallet
        SET balance = $1
        WHERE wallet_id = $2
        `,
        [receiver.balance! + amount, receiver.wallet_id]
      );

      /* Log successful transaction */
      await db.query(
        `
        INSERT INTO transactions 
        (sender_phone_no, receiver_phone_no, amount, transaction_status, transaction_message) 
        VALUES ($1, $2, $3, $4, $5)
        `,
        [phone_no, receiver_phone_no, amount, "TRUE", "success"]
      );

      await db.query("COMMIT");
      res.send("Payment successful");
    } catch (err: any) {
      console.log(err);
      await db.query("ROLLBACK");

      /* Log failed transaction */
      const noReceiver = err.message == "Receiver does not exist";
      await db.query(
        `
        INSERT INTO transactions 
        (sender_phone_no, receiver_phone_no, amount, transaction_status, transaction_message) 
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          phone_no,
          noReceiver ? null : receiver_phone_no,
          amount,
          "FALSE",
          err.message,
        ]
      );
      if (
        err.message == "Receiver does not exist" ||
        err.message == "Amount must be positive" ||
        err.message == "Insufficient balance" ||
        err.message == "You can't pay yourself"
      ) {
        res.status(422).send(err.message);
      } else {
        res.status(500).send("Internal server error");
      }
    }
  }
);

export default router;
