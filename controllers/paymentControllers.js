import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import ErrorHandler from "../utils/ErrorHandler.js";

export const processPayments = async (req, res, next) => {
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const payment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "E-Kart",
        Founder: "Shubham Prakash",
      },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      client_secret: payment.client_secret,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};
