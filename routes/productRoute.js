import express from "express";
import {
  createProduct,
  createProductReview,
  deleteProduct,
  deleteReview,
  getAllProducts,
  getAllProducts_Admin,
  getCatList,
  getProductDetails,
  getProductReviews,
  updateProduct,
} from "../controllers/productController.js";
import {
  authorisedRole,
  isAuthenticatedUser,
} from "../middlewares/authentication.js";

const productRouter = express.Router();

productRouter.route("/products/categories").get(getCatList);
productRouter.route("/products").get(getAllProducts);
productRouter.route("/product/:id").get(getProductDetails);
productRouter
  .route("/product/review/:id")
  .put(isAuthenticatedUser, createProductReview)
  .get(isAuthenticatedUser, getProductReviews);

// TODO make for admin only
productRouter
  .route("/admin/products")
  .get(isAuthenticatedUser, authorisedRole("admin"), getAllProducts_Admin);
productRouter
  .route("/product/new")
  .post(isAuthenticatedUser, authorisedRole("admin"), createProduct);
productRouter
  .route("/product/:id")
  .put(isAuthenticatedUser, authorisedRole("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorisedRole("admin"), deleteProduct);
productRouter
  .route("/product/review/:productId")
  .delete(isAuthenticatedUser, authorisedRole("admin"), deleteReview);

export default productRouter;
