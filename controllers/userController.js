import ErrorHandler from "../utils/ErrorHandler.js";
import { StatusCodes } from "http-status-codes";
import User from "../Models/userModel.js";
import sendToken from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, pswd, avatar } = req.body;

    const avatarCloudinaryRes = await cloudinary.v2.uploader.upload(avatar, {
      folder: "e-kart/usersAvatars",
      width: 160,
      height: 160,
      crop: "scale",
    });

    // console.log("here, checkibng: ", avatarCloudinaryRes);

    const user = await User.create({
      name,
      email,
      pswd,
      avatar: {
        public_id: avatarCloudinaryRes.public_id,
        url: avatarCloudinaryRes.secure_url,
      },
    });

    sendToken(user, StatusCodes.CREATED, req, res);
  } catch (err) {
    console.log(err);
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, pswd } = req.body;

    // check if user email and pswd both provided
    if (!email || !pswd) {
      return next(
        new ErrorHandler(
          "Please enter e-mail & password",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const userFound = await User.findOne({ email }).select("pswd");
    // console.log("userFound: ", userFound);
    if (!userFound) {
      return next(
        new ErrorHandler("Invalid E-mail or password", StatusCodes.UNAUTHORIZED)
      );
    }
    const isPswdMatched = await userFound.comparePassword(pswd);
    // console.log('\nisPswdMatched: ', isPswdMatched);
    if (!isPswdMatched) {
      return next(
        new ErrorHandler("Invalid E-mail or password", StatusCodes.UNAUTHORIZED)
      );
    }

    //  if everything matched successfully
    sendToken(userFound, StatusCodes.OK, req, res);
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now()),
    };

    res.cookie("token", null, cookieOptions);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Logged-out successfully",
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorHandler("User Not Found", StatusCodes.NOT_FOUND));
    }

    // getting password rset token
    const pswdResetToken = await user.getResetPswdToken();

    // saving to db
    await user.save({ validateBeforeSave: false });

    const clientBaseURI = process.env.CLIENT_BASE_URI;
    const resetPswdURI = `${clientBaseURI}/password/reset/${pswdResetToken}`;

    const resetPswdMessage = `Your password reset token is :- \n\n ${resetPswdURI} \n\nIf you have not requested this email then, please ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "E-kart Password recovery",
        message: resetPswdMessage,
      });

      res.status(StatusCodes.OK).json({
        success: true,
        message: `Password reset link sent to ${user.email}`,
      });
    } catch (errr) {
      // deleting resetPswdToken
      user.resetPswdToken = undefined;
      user.resetPswdExpire = undefined;

      // saving user to db
      await user.save({ validateBeforeSave: false });

      return next(
        new ErrorHandler(errr.message, StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    // creating token hash
    const resetPswdToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPswdToken,
      resetPswdExpire: { $gt: new Date(Date.now()) },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "Reset password token is either invalid or has been expired",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    // if token matched, then proceed further
    // comparing enterd password and confirm password
    if (req.body.password !== req.body.confirmPassword) {
      return next(
        new ErrorHandler(
          "Password and Confirm Password are not same",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    // final updation
    user.pswd = req.body.password;
    user.resetPswdToken = undefined;
    user.resetPswdExpire = undefined;

    await user.save();

    // updating cookie
    sendToken(user, StatusCodes.OK, req, res);
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorHandler("Invalid User ID", StatusCodes.BAD_REQUEST));
    }

    res.status(StatusCodes.OK).json({
      success: true,
      user,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("pswd");

    const isPswdMatched = await user.comparePassword(req.body.oldPswd);

    if (!isPswdMatched) {
      return next(
        new ErrorHandler("Old Password Incorrect", StatusCodes.BAD_REQUEST)
      );
    }

    if (req.body.newPswd !== req.body.cnfPswd) {
      return next(
        new ErrorHandler(
          "New Password and Confirm password must be same",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    user.pswd = req.body.newPswd;

    await user.save();

    sendToken(user, StatusCodes.OK, req, res);
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const modifiedData = {
      name: req.body.name,
      email: req.body.email,
    };

    // if new avatar is provided
    if (req.body.avatar) {
      const user = await User.findById(req.user.id);

      // deletig prev. image from cloudinary
      const currImgId = user.avatar.public_id;
      await cloudinary.v2.uploader.destroy(currImgId);

      // uploading new avatar to cloudinary
      const newImg = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "e-kart/usersAvatars",
        width: 160,
        height: 160,
        crop: "scale",
      });

      modifiedData.avatar = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }

    const modUser = await User.findByIdAndUpdate(req.user.id, modifiedData, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      modUser,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// ADMIN ROUTE CONTROLLERS
export const getAllUSers_Admin = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(StatusCodes.OK).json({
      success: true,
      users,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const getUserDetails_Admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHandler(
          `No user with uid: ${req.params.id}`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      user,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const currUserData = req.body.user;

    const modUser = { ...currUserData, role: req.body.role };

    await User.findByIdAndUpdate(req.params.id, modUser, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      modUser,
      message: `User's role changed to ${req.body.role}`,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHandler(
          `No user exists with uid: ${req.params.id}`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    // deleting user avatar from cloudinary
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.remove();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};
