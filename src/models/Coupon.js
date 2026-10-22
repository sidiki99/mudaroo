
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Discount type is required"],
    },

    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0.01, "Discount value must be greater than 0"],
    },

    minimumOrder: {
      type: Number,
      default: 0,
      min: [0, "Minimum order cannot be negative"],
    },

    maxDiscount: {
      type: Number,
      default: null,
      min: [0, "Maximum discount cannot be negative"],
    },

    usageLimit: {
      type: Number,
      default: null,
      min: [1, "Usage limit must be at least 1"],
      validate: {
        validator: (value) =>
          value === null || Number.isInteger(value),
        message: "Usage limit must be a whole number",
      },
    },

    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Used count must be a whole number",
      },
    },

    startsAt: {
      type: Date,
      required: [true, "Coupon start date is required"],
    },

    expiresAt: {
      type: Date,
      required: [true, "Coupon expiry date is required"],
      validate: {
        validator: function (value) {
          return !this.startsAt || value > this.startsAt;
        },
        message: "Expiry date must be after the start date",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Percentage discounts cannot exceed 100%
couponSchema.pre("validate", function () {
  if (
    this.discountType === "percentage" &&
    this.discountValue > 100
  ) {
    this.invalidate(
      "discountValue",
      "Percentage discount cannot exceed 100%"
    );
  }
});

const Coupon =
  mongoose.models.Coupon ||
  mongoose.model("Coupon", couponSchema);

export default Coupon;
