import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

import { requireAdmin } from "@/app/admin/requireAdmin/route";


const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

// PATCH /api/admin/orders/:id   body: { status?, fulfillmentStatus? }
// Next.js 15+: params is a Promise. On Next 14 use `{ params }` and `params.id`.
export async function PATCH(request, { params }) {
  try {
    const { response } = await requireAdmin(request);
    if (response) return response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const update = {};

    if (body.status !== undefined) {
      const status = String(body.status).toLowerCase();
      if (!STATUSES.includes(status)) {
        return NextResponse.json(
          { success: false, message: "Invalid order status." },
          { status: 400 }
        );
      }
      update.status = status;
    }

    if (body.fulfillmentStatus !== undefined) {
      const fulfillmentStatus = String(body.fulfillmentStatus).toLowerCase();
      if (!STATUSES.includes(fulfillmentStatus)) {
        return NextResponse.json(
          { success: false, message: "Invalid fulfillment status." },
          { status: 400 }
        );
      }
      update.fulfillmentStatus = fulfillmentStatus;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, message: "Nothing to update." },
        { status: 400 }
      );
    }

    await connectDB();

    // Saved to MongoDB, so the change is permanent
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 }
      );
    }
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    console.error("ADMIN UPDATE ORDER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order." },
      { status: 500 }
    );
  }
}