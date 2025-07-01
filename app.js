import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { errorMiddleware } from "./middlewares/error.js";

const corsOptions = {
  origin: process.env.ORIGIN,
  methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD"],
  credentials: true,
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// route imports
import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import paymentRouter from "./routes/paymentRoute.js";
import healthcheckRouter from "./routes/healthcheckRoute.js";

// route use
app.use("/api/v1/", healthcheckRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", paymentRouter);
app.use("/api/v1", orderRouter);

// error middleware
app.use(errorMiddleware);

export default app;
