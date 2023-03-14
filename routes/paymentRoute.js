import express from "express";
import { processPayments } from "../controllers/paymentControllers.js";
import { isAuthenticatedUser } from "../middlewares/authentication.js";

const paymentRouter = express.Router();

paymentRouter
  .route("/payment/process")
  .post(isAuthenticatedUser, processPayments);

export default paymentRouter;
