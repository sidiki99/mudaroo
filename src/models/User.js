
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Delivery address schema
const addressSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    addressLine: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    province: {
      type: String,
      trim: true,
      default: "",
    },

    postalCode: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

// User schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    passwordHash: {
      type: String,
      required: function () {
        return this.authProvider === "email";
      },
      select: false,
    },

    authProvider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
      required: true,
    },

    providerId: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Accept password during signup
userSchema.virtual("password").set(function (password) {
  this._password = password;
});

// Hash password before validation
userSchema.pre("validate", async function () {
  if (this._password === undefined) return;

  if (
    typeof this._password !== "string" ||
    this._password.length < 8 ||
    Buffer.byteLength(this._password, "utf8") > 72
  ) {
    this.invalidate(
      "password",
      "Password must be at least 8 characters and no more than 72 UTF-8 bytes"
    );
    return;
  }

  this.passwordHash = await bcrypt.hash(this._password, 12);
  this._password = undefined;
});

// Verify password during login
userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

// Next.js model caching
const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
