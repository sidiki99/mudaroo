
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
      index: true,
    },

    provider: {
      type: String,
      enum: ["stripe", "paypal", "jazzcash", "easypaisa", "cod"],
      required: [true, "Payment provider is required"],
    },

    providerReference: {
      type: String,
      trim: true,
      default: null,
    },

    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Payment amount cannot be negative"],
    },

    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "PKR",
      enum: ["PKR", "USD"],
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      required: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate payment records for the same provider transaction.
paymentSchema.index(
  { provider: 1, providerReference: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerReference: { $type: "string" },
    },
  }
);

const Payment =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);

export default Payment;
