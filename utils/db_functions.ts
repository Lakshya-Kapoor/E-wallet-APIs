import { User, Wallet } from "../types/customTypes";
import { PoolClient } from "pg";
import { databaseError } from "./customError";

export const createWallet = async (client: PoolClient): Promise<Wallet> => {
  try {
    const walletResult = await client.query(
      `INSERT INTO wallet (balance) VALUES(1000) RETURNING *`
    );
    return walletResult.rows[0];
  } catch (err) {
    console.log("Logged in db_function:\n", err);
    throw new databaseError("Failed to create wallet");
  }
};

export const createUser = async (
  client: PoolClient,
  name: string,
  phone_no: number,
  wallet_id: number,
  password: string
): Promise<User> => {
  try {
    const userResult = await client.query(
      `INSERT INTO users (user_name, phone_no, wallet_id, user_password)
      VALUES ($1, $2, $3, $4) RETURNING *
      `,
      [name, phone_no, wallet_id, password]
    );
    return userResult.rows[0];
  } catch (err) {
    console.log("Logged in db_function:\n", err);
    throw new databaseError("Failed to create user");
  }
};

export const getUsers = async (client: PoolClient): Promise<User[]> => {
  try {
    const userResult = await client.query(
      `SELECT * FROM users 
      JOIN wallet ON users.wallet_id = wallet.wallet_id
      `
    );
    return userResult.rows;
  } catch (err) {
    console.log("Logged in db_function:\n", err);
    throw new databaseError("Failed to get users");
  }
};

export const getUser = async (
  client: PoolClient,
  phone_no: number
): Promise<User> => {
  try {
    const userResult = await client.query(
      `SELECT * FROM users WHERE phone_no = $1`,
      [phone_no]
    );
    return userResult.rows[0];
  } catch (err) {
    console.log("Logged in db_function:\n", err);
    throw new databaseError("Failed to get user");
  }
};

export const getUserAndWallet = async (
  client: PoolClient,
  phone_no: number
): Promise<User> => {
  try {
    const userWalletResult = await client.query(
      `SELECT * FROM users
      JOIN wallet ON users.wallet_id = wallet.wallet_id 
      WHERE phone_no = $1
      `,
      [phone_no]
    );
    return userWalletResult.rows[0];
  } catch (err) {
    console.log("Logged in db_function:\n", err);
    throw new databaseError("Failed to get user and wallet");
  }
};

export const updateBalance = async (
  client: PoolClient,
  amount: number,
  wallet_id: number
) => {
  try {
    await client.query(
      `UPDATE wallet
      SET balance = balance + $1
      WHERE wallet_id = $2
      `,
      [amount, wallet_id]
    );
  } catch (err) {
    console.log("Logged in db_function:\n", err);
    throw new databaseError("Failed to update wallet balance");
  }
};

export const logTransaction = async (
  client: PoolClient,
  sender_phone_no: number,
  receiver_phone_no: number | null,
  amount: number,
  status: boolean,
  message: string
) => {
  try {
    await client.query(
      `
      INSERT INTO transactions 
      (sender_phone_no, receiver_phone_no, amount, transaction_status, transaction_message) 
      VALUES ($1, $2, $3, $4, $5)
      `,
      [sender_phone_no, receiver_phone_no, amount, status, message]
    );
  } catch (err) {
    console.log("Logged in db_function:\n", err);
    throw new databaseError("Failed to log transaction");
  }
};

export const getTransactions = async (
  client: PoolClient,
  phone_no: number,
  queryData?: any
) => {
  try {
    let transactionResult;
    if (!queryData) {
      transactionResult = await client.query(
        `
          SELECT * FROM transactions
          WHERE (sender_phone_no = $1 OR receiver_phone_no = $1)
          ORDER BY transaction_date DESC
        `,
        [phone_no]
      );
    } else if (queryData.start_date && queryData.end_date) {
      transactionResult = await client.query(
        `
        SELECT * FROM transactions
        WHERE (sender_phone_no = $1 OR receiver_phone_no = $1)
        AND (transaction_date BETWEEN $2 AND ($3::date + INTERVAL '1 day'))
        ORDER BY transaction_date DESC
      `,
        [phone_no, queryData.start_date, queryData.end_date]
      );
    } else if (queryData.start_time && queryData.end_time) {
      transactionResult = await client.query(
        `
        SELECT * FROM transactions
        WHERE (sender_phone_no = $1 OR receiver_phone_no = $1)
        AND (transaction_date BETWEEN $2 AND $3)
        ORDER BY transaction_date DESC
      `,
        [phone_no, queryData.start_time, queryData.end_time]
      );
    }
    return transactionResult!.rows;
  } catch (err) {
    console.log("Logged in db_function:\n", err);
    throw new databaseError("Failed to get transactions");
  }
};

export const getTransactionAggregate = async (
  client: PoolClient,
  phone_no: number
) => {
  try {
    const debitResult = await client.query(
      `
        SELECT SUM(amount) FROM transactions
        WHERE sender_phone_no = $1 AND transaction_status = TRUE
      `,
      [phone_no]
    );
    const creditResult = await client.query(
      `
        SELECT SUM(amount) FROM transactions
        WHERE receiver_phone_no = $1 AND transaction_status = TRUE
      `,
      [phone_no]
    );
    const debited = Number(debitResult.rows[0].sum);
    const credited = Number(creditResult.rows[0].sum);
    return { debited, credited };
  } catch (err) {
    console.log("Logged in db_function:\n", err);
    throw new databaseError("Failed to get transactions");
  }
};
