import express, { NextFunction, Request, Response } from "express";
import { customError } from "./utils/customError";

const PORT = 8000;
const app = express();

// Routers
import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";

// Parses incoming requests with json as payload
app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", userRouter);

// Error handling middleware
app.use((err: customError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  let { status = 500, message = "Something went wrong" } = err;
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});
