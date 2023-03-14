import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the product name"],
    trim: true,
  },

  productDescription: [
    {
      title: {
        type: String,
        required: [true, "Please enter a product description title"],
      },
      description: {
        type: String,
        required: [true, "Please enter a product description"],
      },
      image: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    },
  ],

  category: {
    type: String,
    required: [true, "Please enter the product category"],
  },
  price: {
    type: Number,
    required: [true, "Please enter price of the product"],
    maxLength: [8, "Price cannot exceed 8-figures"],
  },
  rating: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: [true, "image ID not provided"],
      },
      url: {
        type: String,
        required: [true, "image URL not provided"],
      },
    },
  ],
  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    maxLength: [4, "Product stock cannot exceed 4 figures"],
    default: 1,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: [true, "Please enter your name to review this product"],
      },
      userAvatar: {
        type: String,
        required: [true, "please provide user avatar"],
      },
      rating: {
        type: Number,
        required: [true, "Enter your rating between 0-5"],
      },
      comment: {
        type: String,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Product", ProductSchema);
