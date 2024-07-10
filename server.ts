import express from "express";

const PORT = 8000;
const app = express();

// Routers
import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";

// Parses incoming requests with json as payload
app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});
