import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your E-mail"],
    unique: [true, "E-mail already registered"],
    validate: [validator.isEmail, "Please enter a valid e-mail"],
  },
  pswd: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Password should have atleast 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: [true, "image ID not provided"],
    },
    url: {
      type: String,
      required: [true, "image URL not provided"],
    },
  },
  joiningDate: {
    type: Date,
    default: Date.now(),
  },

  role: {
    type: String,
    default: "user",
  },
  resetPswdToken: {
    type: String,
  },
  resetPswdExpire: {
    type: Date,
  },
});

// cannot access object's members using 'this' keyword in arrow fn.,
// so we need to use normal function
userSchema.pre("save", async function (next) {
  // console.log('Here, this refers to- ', this);

  // while updating other user's details, password should not be hashed again
  // if this condition is not written then it will re-hash the pswd each time user's info is updated
  if (!this.isModified("pswd")) {
    // ie, if pswd is not modified
    next();
  }

  this.pswd = await bcrypt.hash(this.pswd, 12);
});

//  jwt-token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.getResetPswdToken = async function () {
  // token genr.
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hashing & adding to userSchema
  // TODO: change crypto.. bc its deprecated and use nodejs inbuilt crypto module
  // TODO: Do this in all pages
  this.resetPswdToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPswdExpire = new Date(Date.now() + 15 * 60 * 1000); //15 min

  return resetToken;
};

userSchema.methods.comparePassword = async function (pswd) {
  return await bcrypt.compare(pswd, this.pswd);
};

export default mongoose.model("User", userSchema);
