
import mongoose from "mongoose";

// Schema for each item in the cart
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Product variant is required"],
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
  },
  {
    _id: true,
  }
);

// Main cart schema
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Reuse the model during Next.js hot reloads
const Cart =
  mongoose.models.Cart ||
  mongoose.model("Cart", cartSchema);

export default Cart;
