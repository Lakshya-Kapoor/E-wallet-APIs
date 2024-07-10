import { Request, Response } from "express";
import pool from "../db";
import { User, Payment } from "../types/customTypes";
import { PoolClient } from "pg";

export const getUserBalance = async (req: Request, res: Response) => {
  const { phone_no } = req.user;
  let client: PoolClient;
  try {
    client = await pool.connect();
    const { balance } = (
      await client.query(
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
  } finally {
    if (client!) client.release();
  }
};

export const payUser = async (req: Request, res: Response) => {
  const { phone_no } = req.user;
  const { amount, receiver_phone_no }: Payment = req.body;
  let client: PoolClient;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    /* Get sender details */
    const senderResult: User[] = (
      await client.query(
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
      await client.query(
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
    await client.query(
      `
        UPDATE wallet
        SET balance = $1
        WHERE wallet_id = $2
        `,
      [sender.balance! - amount, sender.wallet_id]
    );

    /* Credit receiver */
    await client.query(
      `
        UPDATE wallet
        SET balance = $1
        WHERE wallet_id = $2
        `,
      [receiver.balance! + amount, receiver.wallet_id]
    );

    /* Log successful transaction */
    await client.query(
      `
        INSERT INTO transactions 
        (sender_phone_no, receiver_phone_no, amount, transaction_status, transaction_message) 
        VALUES ($1, $2, $3, $4, $5)
        `,
      [phone_no, receiver_phone_no, amount, "TRUE", "success"]
    );

    await client.query("COMMIT");
    res.send("Payment successful");
  } catch (err: any) {
    console.log(err);
    if (client!) {
      await client.query("ROLLBACK");

      /* Log failed transaction */
      const noReceiver = err.message == "Receiver does not exist";
      await client.query(
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
  } finally {
    if (client!) client.release();
  }
};

export const getUserTransactions = async (req: Request, res: Response) => {
  const { phone_no } = req.user;
  let client: PoolClient;
  try {
    client = await pool.connect();
    const transactions = (
      await client.query(
        `
        SELECT * FROM transactions
        WHERE sender_phone_no = $1 OR receiver_phone_no = $1
        ORDER BY transaction_date DESC
      `,
        [phone_no]
      )
    ).rows;

    res.json(transactions);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  } finally {
    if (client!) client.release();
  }
};
