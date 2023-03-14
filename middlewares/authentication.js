import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler.js";
import User from "../Models/userModel.js";

export const isAuthenticatedUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    // console.log("token: ", token);

    if (!token) {
      return next(
        new ErrorHandler(
          "Please login to access this resource",
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    const decodedData = jwt.verify(token, process.env.JWT_KEY);
    // console.log("decodedData: ", decodedData);

    req.user = await User.findById(decodedData.id);
    // console.log("modified req: ", req);

    next();
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const authorisedRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          StatusCodes.FORBIDDEN
        )
      );
    }

    next();
  };
};
