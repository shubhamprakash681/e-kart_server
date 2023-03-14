import { StatusCodes } from "http-status-codes";
import cloudinary from "cloudinary";
import Product from "../Models/productModel.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import ErrorHandler from "../utils/ErrorHandler.js";

// note:- next is a callback function, used to call a middleware
// try catch block is added to handle async errors

export const createProduct = async (req, res, next) => {
  try {
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = [...req.body.images];
    }

    const imgCloudLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: `/e-kart/products/${req.body.name}`,
      });

      imgCloudLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });

      if (i === images.length - 1) {
        for (let j = 0; j < req.body.productDescription.length; j++) {
          if (req.body.productDescription[j].image) {
            const result = await cloudinary.v2.uploader.upload(
              req.body.productDescription[j].image,
              {
                folder: `/e-kart/products/${req.body.name}`,
              }
            );

            req.body.productDescription[j].image = {
              public_id: result.public_id,
              url: result.secure_url,
            };
          }

          if (j === req.body.productDescription.length - 1) {
            req.body.images = imgCloudLinks;
            req.body.user = req.user.id;

            const product = await Product.create(req.body);

            res.status(StatusCodes.CREATED).json({
              success: true,
              product,
            });
          }
        }
      }
    }
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const getCatList = async (req, res, next) => {
  try {
    const categories = await Product.find().distinct("category");

    const categoryList = categories.map((cat) => {
      return {
        label: cat,
        value: cat,
      };
    });

    res.status(StatusCodes.OK).json({
      success: true,
      categoryList,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// get all products with/without keyword
export const getAllProducts = async (req, res, next) => {
  try {
    const totalProductCount = await Product.countDocuments();
    const resultsPerPage = 10;

    // console.log("here, req.query: ", req.query);
    const apiFeatures = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultsPerPage);

    const products = await apiFeatures.query;
    const filteredProdCount = products.length;

    res.status(StatusCodes.OK).json({
      success: true,
      products,
      totalProductCount,
      resultsPerPage,
      filteredProdCount,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// get product details by id
export const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorHandler("Product not found", StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      product,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const review = {
      user: req.user._id,
      name: req.user.name,
      userAvatar: req.user.avatar.url,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);

    // cheking if the current user has already reviewed the product
    const isReviewedByCurrentUser = product.reviews.find((curRev) => {
      return curRev.user.toString() === req.user._id.toString();
    });

    if (isReviewedByCurrentUser) {
      // updating
      product.reviews.forEach((curRev) => {
        if (curRev.user.toString() === req.user._id.toString()) {
          curRev.rating = rating;
          curRev.comment = comment;
        }
      });
    } else {
      // creating new review
      product.reviews.push(review);
      product.numberOfReviews = product.reviews.length;
    }

    // changing overall rating of the product
    let ratingSum = 0;
    product.reviews.forEach((rev) => {
      ratingSum += rev.rating;
    });

    product.rating = ratingSum / product.reviews.length;

    // saving product to db
    await product.save({
      validateBeforeSave: false,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Product reviewed successfully",
      review,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// ADMIN
export const getAllProducts_Admin = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(StatusCodes.OK).json({
      success: true,
      products,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// update a Product by id
export const updateProduct = async (req, res, next) => {
  try {
    console.log("hree, req.body: ", req.body);

    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorHandler("Product Not Found", StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }

    let images = [...req.body.images];
    let count = images.length;
    // console.log(images);

    // deleting old images from cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    // for (let i = 0; i < product.productDescription.length; i++) {
    //   if (product.productDescription[i].image) {
    //     await cloudinary.v2.uploader.destroy(
    //       product.productDescription[i].image.public_id
    //     );
    //   }
    // }

    const newImgCloudLinks = [];
    images.forEach(async (img, index) => {
      const result = await cloudinary.v2.uploader.upload(img, {
        folder: `/e-kart/products/${req.body.name}`,
      });

      newImgCloudLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });

      count -= 1;
      if (count === 0) {
        req.body.images = newImgCloudLinks;

        for (let i = 0; i < req.body.productDescription.length; i++) {
          if (req.body.productDescription[i].image) {
            const result = await cloudinary.v2.uploader.upload(
              req.body.productDescription[i].image,
              {
                folder: `/e-kart/products/${req.body.name}`,
              }
            );

            req.body.productDescription[i].image = {
              public_id: result.public_id,
              url: result.secure_url,
            };
          }

          if (i === req.body.productDescription.length - 1) {
            product = await Product.findByIdAndUpdate(req.params.id, req.body, {
              new: true,
              runValidators: true,
              useFindAndModify: true,
            });

            res.status(StatusCodes.OK).json({
              success: true,
              product,
              message: "Product Updated Successfully",
            });
          }
        }
      }
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// delete a Product by id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorHandler("Product Not Found", StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }

    // delete all images from cloudinary
    product.images.forEach(async (img, index) => {
      await cloudinary.v2.uploader.destroy(img.public_id);
    });

    await product.remove();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      // if no  product with given id exists
      return next(new ErrorHandler("Product not found", StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      success: true,
      reviews: product.reviews,
      productId: req.params.id,
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return next(new ErrorHandler("Product Not Found", StatusCodes.NOT_FOUND));
    }

    const modReviews = product.reviews.filter((review) => {
      return review._id.toString() !== req.query.id.toString();
    });

    // changing overall rating of the product
    let ratingSum = 0;
    modReviews.forEach((rev) => {
      ratingSum += rev.rating;
    });

    let newRating = 0;

    if (modReviews.length === 0) {
      newRating = 0;
    } else {
      newRating = ratingSum / modReviews.length;
    }

    // saving product to db
    await Product.findByIdAndUpdate(
      req.params.productId,
      {
        reviews: modReviews,
        rating: newRating,
        numberOfReviews: modReviews.length,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    return next(
      new ErrorHandler(err.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};
