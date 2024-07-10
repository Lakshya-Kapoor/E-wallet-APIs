import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import db from "../config/db";
import bcrypt from "bcrypt";
import { AuthBody, Wallet, User } from "../types/customTypes";
import reqBodyValidation from "../middleware/requestBodyValidation";
import { signUpSchema, logInSchema } from "../schemas/reqBodySchemas";

import dotenv from "dotenv";
dotenv.config();

router.post("/signup", reqBodyValidation(signUpSchema), async (req, res) => {
  const { name, phone_no, password }: AuthBody = req.body;
  try {
    await db.query("BEGIN");

    let wallet: Wallet = (
      await db.query(`INSERT INTO wallet (balance) VALUES(1000) RETURNING *`)
    ).rows[0];

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await db.query(
      `INSERT INTO users (user_name, phone_no, wallet_id, user_password)
        VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, phone_no, wallet.wallet_id, hashedPassword]
    );

    console.log(user.rows[0]);

    await db.query("COMMIT");

    res.status(200).send("User signed up successfully");
  } catch (err) {
    console.log(err);
    await db.query("ROLLBACK");

    res.status(400).send("Bad request or server error");
  }
});

router.post("/login", reqBodyValidation(logInSchema), async (req, res) => {
  const { phone_no, password }: AuthBody = req.body;

  try {
    const users: User[] = (
      await db.query(`SELECT * FROM users WHERE phone_no = $1`, [phone_no])
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
  }
});

export default router;
