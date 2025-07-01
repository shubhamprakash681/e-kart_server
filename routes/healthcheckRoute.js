import express from "express";
import { StatusCodes } from "http-status-codes";

const healthcheckRouter = express.Router();

healthcheckRouter.route("/").get((req, res, next) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Ekart Server running",
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
  });
});

export default healthcheckRouter;
