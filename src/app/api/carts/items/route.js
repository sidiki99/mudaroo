
import { verifyJWT } from "@/auth/varifyJWT";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const user = await verifyJWT();

    if (!user || !user._id) {
      return NextResponse.json(
        {
          success: false,
          message: "No authenticated user found.",
        },
        { status: 401 }
      );
    }

    
    const body = await request.json();
    const { productId, variantId, quantity = 1 } = body;

    
    if (!productId || !variantId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID and variant ID are required.",
        },
        { status: 400 }
      );
    }

   
    if (
      !mongoose.isValidObjectId(productId) ||
      !mongoose.isValidObjectId(variantId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID or variant ID.",
        },
        { status: 400 }
      );
    }

  
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be a positive whole number.",
        },
        { status: 400 }
      );
    }

 
    const product = await Product.findById(productId);

    if (!product || product.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found or inactive.",
        },
        { status: 404 }
      );
    }

    //To Find selected variant
    const variant = product.variants?.find(
      (item) => item._id.toString() === variantId
    );

    if (!variant) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected product variant was not found.",
        },
        { status: 404 }
      );
    }

    // To Check available stock
    if (variant.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${variant.stock} item(s) are available.`,
        },
        { status: 400 }
      );
    }

    //To Find or create user's cart
    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = new Cart({
        user: user._id,
        items: [],
      });
    }

    // To Check whether the variant is already in the cart
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variantId.toString() === variantId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > variant.stock) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${variant.stock} item(s) are available in total.`,
          },
          { status: 400 }
        );
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        variantId,
        quantity,
      });
    }

    // Save cart
    await cart.save();

    return NextResponse.json(
      {
        success: true,
        message: "Product added to cart successfully.",
        cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add to cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to add product to cart.",
      },
      { status: 500 }
    );
  }
}
