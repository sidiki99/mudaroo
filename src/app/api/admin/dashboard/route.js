import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

import { verifyJWT } from "@/auth/varifyJWT";
// export const dynamic = "force-dynamic";

function calculateChange(current, previous) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Number(
    (((current - previous) / previous) * 100).toFixed(2)
  );
}

export async function GET(request) {

  try{
  const decoded = await  verifyJWT(request)

  if (!decoded) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    const userId =  decoded._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid authentication token." },
        { status: 401 }
      );
    }

    await connectDB();
    const admin = await User.findById(userId).select("role");

    if (!admin) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 401 }
      );
    }

    
    if (admin.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const now = new Date();
    const currentStart = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    );
    const previousStart = new Date(
      now.getTime() - 14 * 24 * 60 * 60 * 1000
    );

// const orders = await Order.countDocuments
// const users = await User.countDocuments({
//   role:"user"
// })
// }

const [
      totalOrders,
      totalProducts,
      totalCustomers,
      currentOrders,
      previousOrders,
      currentProducts,
      previousProducts,
      currentCustomers,
      previousCustomers,
    ] = await Promise.all([
      Order.countDocuments(),

      Product.countDocuments(),

      User.countDocuments({ role: "customer" }),

      Order.countDocuments({
        createdAt: { $gte: currentStart, $lte: now },
      }),

      Order.countDocuments({
        createdAt: { $gte: previousStart, $lt: currentStart },
      }),

      Product.countDocuments({
        createdAt: { $gte: currentStart, $lte: now },
      }),

      Product.countDocuments({
        createdAt: { $gte: previousStart, $lt: currentStart },
      }),

      User.countDocuments({
        role: "customer",
        createdAt: { $gte: currentStart, $lte: now },
      }),

      User.countDocuments({
        role: "customer",
        createdAt: { $gte: previousStart, $lt: currentStart },
      }),
    ])
  
  const revenueFilter = {
      paymentStatus: "paid",
      orderStatus: { $nin: ["cancelled", "returned"] },
    };

      const [
      allRevenue,
      currentRevenue,
      previousRevenue,
    ] = await Promise.all([
      Order.aggregate([
        { $match: revenueFilter },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            ...revenueFilter,
            createdAt: { $gte: currentStart, $lte: now },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            ...revenueFilter,
            createdAt: { $gte: previousStart, $lt: currentStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),
    ]);

       const totalRevenue = allRevenue[0]?.total ?? 0;
    const currentRevenueTotal = currentRevenue[0]?.total ?? 0;
    const previousRevenueTotal = previousRevenue[0]?.total ?? 0;

     return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,

      revenueChange: calculateChange(
        currentRevenueTotal,
        previousRevenueTotal
      ),

      ordersChange: calculateChange(
        currentOrders,
        previousOrders
      ),

      productsChange: calculateChange(
        currentProducts,
        previousProducts
      ),
       customersChange: calculateChange(
        currentCustomers,
        previousCustomers
      ),
    });
  } catch (error) {
    console.error("Admin statistics error:", error);

    return NextResponse.json(
      { message: "Unable to load dashboard statistics." },
      { status: 500 }
    );
  }



  
  }
