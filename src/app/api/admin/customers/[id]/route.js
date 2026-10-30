import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { requireAdmin } from "@/app/admin/requireAdmin/route";


// Next.js 15+: params is a Promise. On Next 14 use `{ params }` and `params.id`.

// GET /api/admin/customers/:id -> profile, addresses and the 5 most recent orders
export async function GET(request, { params }) {
  try {
    const { response } = await requireAdmin(request);
    if (response) return response;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid customer ID." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ _id: id, role: "customer" }).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "Customer not found." }, { status: 404 });
    }

    const recentOrders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber total status createdAt items")
      .lean();

    return NextResponse.json({
      success: true,
      customer: {
        _id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        isActive: user.isActive !== false,
        createdAt: user.createdAt,
        addresses: user.addresses || [],
      },
      recentOrders,
    });
  } catch (error) {
    console.error("ADMIN GET CUSTOMER ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch customer." }, { status: 500 });
  }
}

// PATCH /api/admin/customers/:id   body: { isActive: boolean }
export async function PATCH(request, { params }) {
  try {
    const { response } = await requireAdmin(request);
    if (response) return response;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid customer ID." }, { status: 400 });
    }

    // Without this field in the schema Mongoose would silently drop the update
    if (!User.schema.path("isActive")) {
      return NextResponse.json(
        {
          success: false,
          message: "Add `isActive: { type: Boolean, default: true }` to the User schema first.",
        },
        { status: 400 }
      );
    }

    const { isActive } = await request.json();
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ success: false, message: "isActive must be true or false." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { _id: id, role: "customer" },
      { $set: { isActive } },
      { new: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: isActive ? "Customer activated." : "Customer deactivated.",
      isActive: user.isActive !== false,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "Invalid JSON request body." }, { status: 400 });
    }
    console.error("ADMIN UPDATE CUSTOMER ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to update customer." }, { status: 500 });
  }
}