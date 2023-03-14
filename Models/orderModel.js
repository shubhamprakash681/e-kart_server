import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  shippingDetails: {
    address: {
      type: String,
      required: [true, "Please Enter Shipping Address"],
    },
    city: {
      type: String,
      required: [true, "Please Enter Shipping Address City"],
    },
    state: {
      type: String,
      required: [true, "Please Enter Shipping Address State"],
    },
    country: {
      type: String,
      required: [true, "Please Enter Shipping Address Country"],
    },
    pinCode: {
      type: Number,
      required: [true, "Please Enter Shipping Address Pin code"],
    },
    phoneNo: {
      type: String,
      required: [true, "Please Enter Contact Number"],
    },
  },

  orderItems: [
    {
      count: {
        type: Number,
        required: [true, "Please enter product count"],
      },

      product: {
        _id: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "Product Id not provided"],
        },

        name: {
          type: String,
          required: [true, "Please enter the product name"],
          trim: true,
        },
        price: {
          type: Number,
          required: [true, "Please enter price of the product"],
          maxLength: [8, "Price cannot exceed 8-figures"],
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
      },
    },
  ],

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  paidAt: {
    type: Date,
    required: true,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "processing",
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", OrderSchema);
