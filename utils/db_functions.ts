import { User, Wallet } from "../types/customTypes";
import { Pool, PoolClient } from "pg";
import { databaseError } from "./customError";

export const createWallet = async (client: PoolClient): Promise<Wallet> => {
  try {
    const walletResult = await client.query(
      `INSERT INTO wallet (balance) VALUES(1000) RETURNING *`
    );
    return walletResult.rows[0];
  } catch (err) {
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
    throw new databaseError("Failed to create user");
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
    throw new databaseError("Failed to get user and wallet");
  }
};

export const updateBalance = async (
  client: PoolClient,
  newBalance: number,
  wallet_id: number
) => {
  try {
    await client.query(
      `UPDATE wallet
      SET balance = $1
      WHERE wallet_id = $2
      `,
      [newBalance, wallet_id]
    );
  } catch (err) {
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
    throw new databaseError("Failed to log transaction");
  }
};

export const getTransactions = async (client: PoolClient, phone_no: number) => {
  try {
    const transactionResult = await client.query(
      `
      SELECT * FROM transactions
      WHERE sender_phone_no = $1 OR receiver_phone_no = $1
      ORDER BY transaction_date DESC
      `,
      [phone_no]
    );
    return transactionResult.rows;
  } catch (err) {
    throw new databaseError("Failed to get transactions");
  }
};
