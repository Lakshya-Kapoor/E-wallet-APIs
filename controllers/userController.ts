import { NextFunction, Request, Response } from "express";
import pool from "../config/db";
import { Payment } from "../types/customTypes";
import { PoolClient } from "pg";
import {
  getUserAndWallet,
  logTransaction,
  updateBalance,
  getTransactions,
} from "../utils/db_functions";
import { customError } from "../utils/customError";
import throwError from "../utils/throwError";

export const getUserBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone_no } = req.user;
  let client: PoolClient;
  try {
    client = await pool.connect();

    const { balance } = await getUserAndWallet(client, phone_no);

    res.json({ balance });
  } catch (err) {
    next(throwError(err));
  } finally {
    client!.release();
  }
};

export const payUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone_no } = req.user;
  const { amount, receiver_phone_no }: Payment = req.body;
  let client: PoolClient;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    /* Get sender details */
    const sender = await getUserAndWallet(client, phone_no);
    /* Get receiver details*/
    const receiver = await getUserAndWallet(client, receiver_phone_no);

    if (!receiver) {
      throw new customError(422, "Receiver does not exist");
    }
    if (receiver.phone_no == sender.phone_no) {
      throw new customError(422, "You can't pay yourself");
    }
    if (amount <= 0) {
      throw new customError(422, "Amount must be positive");
    }
    if (sender.balance! < amount) {
      throw new customError(422, "Insufficient balance");
    }

    /* Debit sender */
    const senderBalace = sender.balance! - amount;
    await updateBalance(client, senderBalace, sender.wallet_id);
    /* Credit receiver */
    const receiverBalace = receiver.balance! - amount;
    await updateBalance(client, receiverBalace, receiver.wallet_id);

    /* Log successful transaction */
    await logTransaction(
      client,
      phone_no,
      receiver_phone_no,
      amount,
      true,
      "success"
    );

    await client.query("COMMIT");
    res.send("Payment successful");
  } catch (err: any) {
    await client!.query("ROLLBACK");

    /* Log failed transaction */
    const noReceiver = err.message == "Receiver does not exist";

    // Not sure how to handle the failure of this log
    await logTransaction(
      client!,
      phone_no,
      noReceiver ? null : receiver_phone_no,
      amount,
      false,
      err.message
    );
    next(throwError(err));
  } finally {
    client!.release();
  }
};

export const getUserTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone_no } = req.user;
  let client: PoolClient;
  try {
    client = await pool.connect();
    const transactions = await getTransactions(client, phone_no);

    res.json(transactions);
  } catch (err) {
    next(throwError(err));
  } finally {
    client!.release();
  }
};
