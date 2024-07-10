import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "./config/db";
import { AuthBody, Wallet, User } from "./types/customTypes";
import bcrypt from "bcrypt";
import { isAuthenticated } from "./middleware/authMiddleware";

dotenv.config();

const PORT = 8000;
const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  const { name, phone_no, password }: AuthBody = req.body;
  try {
    await db.query("BEGIN");

    let wallet: Wallet = (
      await db.query(`INSERT INTO wallet (balance) VALUES(1000) RETURNING *`)
    ).rows[0];

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await db.query(
      `INSERT INTO users (name_of_user, phoneNo, wallet_id, password)
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

app.post("/login", async (req, res) => {
  const { phone_no, password }: AuthBody = req.body;

  try {
    const users: User[] = (
      await db.query(`SELECT * FROM users WHERE phoneNo = $1`, [phone_no])
    ).rows;

    if (users.length == 0) {
      throw new Error("User doesn't exist");
    }

    if (!(await bcrypt.compare(password, users[0].password))) {
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

app.get("/balance", isAuthenticated, async (req, res) => {
  const { user_id } = req.user;

  try {
    const { balance } = (
      await db.query(
        `
      SELECT balance FROM users
      JOIN wallet ON users.wallet_id = wallet.wallet_id
      WHERE user_id = $1`,
        [user_id]
      )
    ).rows[0];

    res.json({ ...req.user, balance });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});
