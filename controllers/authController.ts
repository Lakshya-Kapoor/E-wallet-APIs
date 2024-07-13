import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db";
import { AuthBody } from "../types/customTypes";
import { PoolClient } from "pg";
import { createUser, getUser, createWallet } from "../utils/db_functions";
import { customError } from "../utils/customError";
import throwError from "../utils/throwError";

export const signUpUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, phone_no, password }: AuthBody = req.body;
  let client: PoolClient;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const wallet = await createWallet(client);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(
      client,
      name!,
      phone_no,
      wallet.wallet_id,
      hashedPassword
    );
    await client.query("COMMIT");

    res.status(200).send("User signed up successfully");
  } catch (err) {
    await client!.query("ROLLBACK");
    next(throwError(err));
  } finally {
    client!.release();
  }
};

export const logInUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone_no, password }: AuthBody = req.body;
  let client: PoolClient;
  try {
    client = await pool.connect();
    const user = await getUser(client, phone_no);

    if (!user) {
      throw new customError(400, "User doesn't exist");
    }

    if (!(await bcrypt.compare(password, user.user_password))) {
      throw new customError(401, "Incorrect password");
    }

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!);
    res.json({ accessToken });
  } catch (err) {
    next(throwError(err));
  } finally {
    client!.release();
  }
};
