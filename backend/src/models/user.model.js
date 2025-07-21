import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\+?[0-9]{10,15}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    otp: String,
    otpExpiry: Date,
    phoneVerified: {
      type: Boolean,
      default: false
    },
    fullname: {
      type: String,
      trim: true,
      index: true,
    },
    savedBlogs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blogs"
    }],
    bookmarks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blogs"
    }],
    sharedBlogs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Share"
    }],
    role: {
      type: String,
      enum: ["ADMIN", "MODERATOR", "USER"],
      default: "USER",
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
    },
    refreshToken: {
      type: String,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blogs"
    }],
    subscribers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users"
    }],
    subscribeTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users"
    }],
    profilePicture: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);