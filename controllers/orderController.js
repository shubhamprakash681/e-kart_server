import { StatusCodes } from "http-status-codes";
import ErrorHandler from "../utils/ErrorHandler.js";
import Order from "../Models/orderModel.js";
import Product from "../Models/productModel.js";
import User from "../Models/userModel.js";

export const newOrder = async (req, res, next) => {
  try {
    const {
      shippingDetails,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt,
    } = req.body;

    const order = await Order.create({
      shippingDetails,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt,
      user: req.user._id,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      order,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(
        new ErrorHandler(
          `Order with id: ${req.params.id} does not exists`,
          StatusCodes.NOT_FOUND
        )
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      order,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });

    res.status(StatusCodes.OK).json({
      success: true,
      orders,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();

    // calculating total worth of all orders
    let totalAmount = 0;
    orders.forEach((order) => (totalAmount += order.totalPrice));

    res.status(StatusCodes.OK).json({
      success: true,
      orders,
      totalAmount,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// admins
// function to update stock of a product
const updateStockOfAProduct = async (productId, units) => {
  const product = await Product.findById(productId);

  product.stock -= units;

  await product.save({ validateBeforeSave: false });
};

export const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(
        new ErrorHandler(
          `Order with id: ${req.params.id} does not exists`,
          StatusCodes.NOT_FOUND
        )
      );
    }

    if (order.orderStatus === "delivered") {
      return next(
        new ErrorHandler(
          "You have already delivered this order",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    // updating
    if (req.body.status === "shipped") {
      // updateing product stock for each product in itemList
      order.orderItems.forEach(async (item) => {
        await updateStockOfAProduct(item.product._id, item.count);
      });
    }

    if (req.body.status === "delivered") {
      order.deliveredAt = Date.now();
    }

    order.orderStatus = req.body.status;

    await order.save({ validateBeforeSave: false });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const deleteOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(
        new ErrorHandler(
          `Order with id: ${req.params.id} does not exists`,
          StatusCodes.NOT_FOUND
        )
      );
    }

    await order.remove();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};
