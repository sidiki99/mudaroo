
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifyJWT } from "@/auth/varifyJWT";
import Cart from "@/models/Cart";

export async function GET() {
  try {
    await connectDB();

    const user = await verifyJWT();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Current user not found. Please log in.",
        },
        { status: 401 }
      );
    }

    // Fetch only the logged-in user's cart
    const carts = await Cart.find({ user: user._id }).lean();

    return NextResponse.json(
      {
        success: true,
        count: carts.length,
        carts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get carts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch carts",
      },
      { status: error.status || 500 }
    );
  }
}
