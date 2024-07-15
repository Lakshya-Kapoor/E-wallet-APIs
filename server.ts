import express, { NextFunction, Request, Response } from "express";
import { customError } from "./utils/customError";

const PORT = 8000;
const app = express();

// Routers
import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";
import adminRouter from "./routes/adminRouter";

// Parses incoming requests with json as payload
app.use(express.json());

// Routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);

// Error handling middleware
app.use((err: customError, req: Request, res: Response, next: NextFunction) => {
  if (!(err instanceof customError)) {
    console.log("Logged in server.ts: \n", err);
  }
  let { status = 500, message = "Something went wrong" } = err;
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});
