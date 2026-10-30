import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User"; // needed so populate("user") works; fix the path if yours differs
import Product from "@/models/Product";
import AdminGuard from "@/app/admin/AdminGuard";
import { requireAdmin } from "@/app/admin/requireAdmin/route";


// GET /api/admin/orders  -> every order from every customer (admin only)
export async function GET(request) {
  try {
    const { response } = await requireAdmin(request);
    if (response) return response;

    await connectDB();

    // Touch the models so Mongoose registers them before populate
    void User;
    void Product;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name fullName username email avatar image phone")
      .populate("items.product", "name images image thumbnail")
      .lean();

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("ADMIN GET ORDERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}