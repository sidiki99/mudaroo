
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { verifyJWT } from "@/auth/varifyJWT";





  //  GET /api/orders   

export async function GET(request) {
  try {
    // 1. Verify JWT using existing middleware
    const decoded = await verifyJWT(request);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to view your orders.",
        },
        { status: 401 }
      );
    }

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication token.",
        },
        { status: 401 }
      );
    }

    //  Connect database
    await connectDB();

    // this user's orders
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders.",
      },
      { status: 500 }
    );
  }
}


  //  POST /api/orders

export async function POST(request) {
  try {
    //  Verify JWT using existing middleware
    const decoded = await verifyJWT(request);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in before placing an order.",
        },
        { status: 401 }
      );
    }

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication token.",
        },
        { status: 401 }
      );
    }

    //  Connect database
    await connectDB();

    //  Read request body
    const body = await request.json();

    const {
      items,
      shippingAddress,
      notes = "",
    } = body;

    //  Validate cart items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    if (items.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many items in one order.",
        },
        { status: 400 }
      );
    }

    //  Validate shipping address
    if (
      !shippingAddress ||
      typeof shippingAddress !== "object" ||
      Array.isArray(shippingAddress)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping address is required.",
        },
        { status: 400 }
      );
    }

    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "province",
    ];

    for (const field of requiredFields) {
      if (
        typeof shippingAddress[field] !== "string" ||
        !shippingAddress[field].trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required.`,
          },
          { status: 400 }
        );
      }
    }

    if (typeof notes !== "string" || notes.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order notes.",
        },
        { status: 400 }
      );
    }

    //  Prepare order items and calculate subtotal
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item || typeof item !== "object") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid cart item.",
          },
          { status: 400 }
        );
      }

      const { product: productId, variantId, quantity } = item;

      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(variantId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid product or variant ID.",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Quantity must be between 1 and 100.",
          },
          { status: 400 }
        );
      }

      // Fetch product from database
      const product = await Product.findById(productId).lean();

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: "A product in your cart no longer exists.",
          },
          { status: 404 }
        );
      }

      // Find selected product variant
      const variant = (product.variants || []).find(
        (v) => String(v._id) === String(variantId)
      );

      if (!variant) {
        return NextResponse.json(
          {
            success: false,
            message: `Selected variant is unavailable for ${product.name}.`,
          },
          { status: 400 }
        );
      }

      // Use the actual database price, never the client price
      const unitPrice = Number(variant.price ?? product.price);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid price for ${product.name}.`,
          },
          { status: 400 }
        );
      }

      // Check stock if your variant schema contains stock
      if (
        variant.stock !== undefined &&
        variant.stock < quantity
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${product.name}.`,
          },
          { status: 400 }
        );
      }

      const lineTotal = unitPrice * quantity;

      orderItems.push({
        product: product._id,
        variantId: variant._id,
        sku: variant.sku,
        name: product.name,
        color: variant.color,
        size: variant.size,
        quantity,
        unitPrice,
        lineTotal,
      });

      subtotal += lineTotal;
    }

    // 7. Calculate totals on the server
    const shippingFee = 0;
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    // 8. Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,

      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2:
          typeof shippingAddress.addressLine2 === "string"
            ? shippingAddress.addressLine2.trim()
            : "",
        city: shippingAddress.city.trim(),
        province: shippingAddress.province.trim(),
        postalCode:
          typeof shippingAddress.postalCode === "string"
            ? shippingAddress.postalCode.trim()
            : "",
        country:
          typeof shippingAddress.country === "string" &&
          shippingAddress.country.trim()
            ? shippingAddress.country.trim()
            : "Pakistan",
      },

      subtotal,
      shippingFee,
      discount,
      total,
      couponCode: null,
      notes: notes.trim(),
    });

    // 9. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully.",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order.",
      },
      { status: 500 }
    );
  }
}
