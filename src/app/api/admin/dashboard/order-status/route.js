
import { NextResponse } from "next/server";


import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB

    const results = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          value: { $sum: 1 },
        },
      },
    ]);

    const labels = {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
    };

    const colors = {
      pending: "#F59E0B",
      processing: "#3B82F6",
      shipped: "#8B5CF6",
      delivered: "#10B981",
      cancelled: "#EF4444",
      returned: "#6B7280",
    };

    const data = Object.keys(labels).map((key) => ({
      key,
      label: labels[key],
      value:
        results.find((item) => item._id === key)?.value || 0,
      color: colors[key],
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Order status API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order status",
      },
      { status: 500 }
    );
  }
}
