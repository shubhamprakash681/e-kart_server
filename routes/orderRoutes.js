import express from "express";
import {
  deleteOrderById,
  getAllOrders,
  getMyOrders,
  getOrderDetails,
  newOrder,
  updateOrder,
} from "../controllers/orderController.js";
import {
  authorisedRole,
  isAuthenticatedUser,
} from "../middlewares/authentication.js";

const orderRouter = express.Router();

orderRouter.route("/order/new").post(isAuthenticatedUser, newOrder);
orderRouter.route("/order/:id").get(isAuthenticatedUser, getOrderDetails);
orderRouter.route("/orders/me").get(isAuthenticatedUser, getMyOrders);

orderRouter
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorisedRole("admin"), getAllOrders);
orderRouter
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorisedRole("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorisedRole("admin"), deleteOrderById);

export default orderRouter;
