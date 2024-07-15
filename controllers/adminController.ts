import { Request, Response, NextFunction } from "express";
import { PoolClient } from "pg";
import pool from "../config/db";
import {
  getTransactionAggregate,
  getTransactions,
  getUsers,
} from "../utils/db_functions";
import { getUserAndWallet } from "../utils/db_functions";
import throwError from "../utils/throwError";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let client: PoolClient;
  try {
    client = await pool.connect();

    const users = await getUsers(client);

    res.json(users);
  } catch (err) {
    next(throwError(err));
  } finally {
    client!.release();
  }
};

export const getUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone_no } = req.params;
  let client: PoolClient;
  try {
    client = await pool.connect();

    const user = await getUserAndWallet(client, Number(phone_no));

    res.json(user);
  } catch (err) {
    next(throwError(err));
  } finally {
    client!.release();
  }
};
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

export const getUserTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone_no } = req.params;
  const { start_date, end_date, start_time, end_time } = req.query;
  let client: PoolClient;
  try {
    client = await pool.connect();

    let transactions;
    if (start_date && end_date) {
      transactions = await getTransactions(client, Number(phone_no), {
        start_date,
        end_date,
      });
    } else if (start_time && end_time) {
      transactions = await getTransactions(client, Number(phone_no), {
        start_time,
        end_time,
      });
    } else {
      transactions = await getTransactions(client, Number(phone_no));
    }
    res.json(transactions);
  } catch (err) {
    next(throwError(err));
  } finally {
    client!.release();
  }
};
