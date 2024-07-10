import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../db";
import { AuthBody, Wallet, User } from "../types/customTypes";
import { PoolClient } from "pg";

export const signUpUser = async (req: Request, res: Response) => {
  const { name, phone_no, password }: AuthBody = req.body;
  let client: PoolClient;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    let wallet: Wallet = (
      await client.query(
        `INSERT INTO wallet (balance) VALUES(1000) RETURNING *`
      )
    ).rows[0];

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await client.query(
      `INSERT INTO users (user_name, phone_no, wallet_id, user_password)
          VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, phone_no, wallet.wallet_id, hashedPassword]
    );

    console.log(user.rows[0]);

    await client.query("COMMIT");

    res.status(200).send("User signed up successfully");
  } catch (err) {
    console.log(err);
    if (client!) {
      await client.query("ROLLBACK");
    }
    res.status(400).send("Bad request or server error");
  } finally {
    if (client!) client.release();
  }
};

export const logInUser = async (req: Request, res: Response) => {
  const { phone_no, password }: AuthBody = req.body;
  let client: PoolClient;
  try {
    client = await pool.connect();
    const users: User[] = (
      await client.query(`SELECT * FROM users WHERE phone_no = $1`, [phone_no])
    ).rows;

    if (users.length == 0) {
      throw new Error("User doesn't exist");
    }

    if (!(await bcrypt.compare(password, users[0].user_password))) {
      throw new Error("Incorrect password");
    }

    const accessToken = jwt.sign(users[0], process.env.ACCESS_TOKEN_SECRET!);
    res.json({ accessToken });
  } catch (err: any) {
    console.log(err);
    if (err.message == "User doesn't exist") {
      res.status(400).send(err.message);
    } else if (err.message == "Incorrect password") {
      res.status(401).send(err.message);
    } else {
      res.status(500).send("Interal server error");
    }
  } finally {
    if (client!) client.release();
  }
};
