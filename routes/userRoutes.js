import express from "express";
import {
  changeUserRole,
  deleteUser,
  forgotPassword,
  getAllUSers_Admin,
  getUserDetails,
  getUserDetails_Admin,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controllers/userController.js";
import {
  authorisedRole,
  isAuthenticatedUser,
} from "../middlewares/authentication.js";

const userRouter = express.Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(logoutUser);

userRouter.route("/password/forgot").post(forgotPassword);
userRouter.route("/password/reset/:token").put(resetPassword);
userRouter.route("/password/update").put(isAuthenticatedUser, updatePassword);

userRouter.route("/me").get(isAuthenticatedUser, getUserDetails);
userRouter.route("/me/update").put(isAuthenticatedUser, updateProfile);

// ADMIN ROUTES
userRouter
  .route("/admin/users")
  .get(isAuthenticatedUser, authorisedRole("admin"), getAllUSers_Admin);

userRouter
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorisedRole("admin"), getUserDetails_Admin)
  .put(isAuthenticatedUser, authorisedRole("admin"), changeUserRole)
  .delete(isAuthenticatedUser, authorisedRole("admin"), deleteUser);

export default userRouter;
