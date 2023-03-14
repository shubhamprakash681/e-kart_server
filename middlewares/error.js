import ErrorHandler from "../utils/ErrorHandler.js";
import { StatusCodes } from "http-status-codes";

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.message = err.message || "INTERNAL SERVER ERROR";

  // for handling 'CastError', eg.: wrong mongodb id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new ErrorHandler(message, StatusCodes.NOT_FOUND);
  }

  // jwt error handling
  if (err.name === "jsonWebTokenError") {
    console.log("jwt error occured");
    const message = `Json Web Token is invalid. Try  again`;
    err = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
  }

  // jwt expire error handling
  if (err.name === "TokenExpiredError") {
    console.log("jwt token expire error occured");
    const message = `Json Web Token has been expired. Try  again`;
    err = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
  }

  // mondo db duplicate key error -> (Eg.: try registering user with same email id)
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error_stack: err.stack,
  });
};
