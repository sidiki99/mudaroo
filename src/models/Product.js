
import mongoose from "mongoose";

// Embedded schema for each purchasable product variant
const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      uppercase: true,
    },

    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
    },

    colorHex: {
      type: String,
      trim: true,
      default: "#000000",
      match: [/^#[0-9A-Fa-f]{6}$/, "Enter a valid hex color"],
    },

    size: {
      type: String,
      required: [true, "Size is required"],
      trim: true,
    },

    sizeType: {
      type: String,
      enum: ["Clothing", "Shoes", "Accessories", "One Size"],
      default: "Clothing",
    },

    sizeSystem: {
      type: String,
      enum: ["International", "US", "UK", "EU", "PK"],
      default: "International",
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    oldPrice: {
      type: Number,
      default: null,
      min: [0, "Old price cannot be negative"],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },
  },
  { _id: true }
);

// Main product schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name is too long"],
    },

    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    audience: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Children", "Unisex"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    images: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      validate: {
        validator: (images) => images.length > 0,
        message: "At least one product image is required",
      },
    },

    material: {
      type: String,
      trim: true,
      default: "",
    },

    variants: {
      type: [variantSchema],
      validate: {
        validator: (variants) => variants.length > 0,
        message: "At least one product variant is required",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate SKUs within the same product
productSchema.pre("validate", function () {
  const skus = this.variants.map((variant) => variant.sku);

  if (new Set(skus).size !== skus.length) {
    this.invalidate(
      "variants",
      "Each variant must have a unique SKU within the product"
    );
  }
});

// Reuse the model during Next.js hot reloads
const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;
