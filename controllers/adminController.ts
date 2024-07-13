import { Request, Response, NextFunction } from "express";
import { PoolClient } from "pg";
import pool from "../config/db";
import { getTransactionAggregate } from "../utils/db_functions";
import { getUserAndWallet } from "../utils/db_functions";
import throwError from "../utils/throwError";

export const verifyUserTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone_no } = req.params;
  let client: PoolClient;
  try {
    client = await pool.connect();

    const { debited, credited } = await getTransactionAggregate(
      client,
      Number(phone_no)
    );

    const { balance } = await getUserAndWallet(client, Number(phone_no));

    res.json({
      debited,
      credited,
      real_balance: balance,
      expected_balance: 1000 + credited - debited,
    });
  } catch (err) {
    next(throwError(err));
  } finally {
    client!.release();
  }
};
