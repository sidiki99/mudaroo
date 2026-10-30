import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyJWT } from "@/auth/varifyJWT";
import { validateAddress } from "@/lib/validateAddress";

const MAX_ADDRESSES = 10;

// POST /api/profile/addresses -> add a delivery address to the logged-in user
export async function POST(request) {
  try {
    const decoded = await verifyJWT(request);
    const userId = decoded && (decoded.userId || decoded.id || decoded._id);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Please log in to add an address." },
        { status: 401 }
      );
    }

    const { data, error } = validateAddress(await request.json());
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    await connectDB();

    // Only add when the user is below the limit (checked atomically in the query)
    const user = await User.findOneAndUpdate(
      { _id: userId, [`addresses.${MAX_ADDRESSES - 1}`]: { $exists: false } },
      { $push: { addresses: data } },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      const exists = await User.exists({ _id: userId });
      return NextResponse.json(
        {
          success: false,
          message: exists
            ? `You can save up to ${MAX_ADDRESSES} addresses.`
            : "User not found.",
        },
        { status: exists ? 400 : 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Address added.", addresses: user.addresses },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "Invalid JSON request body." }, { status: 400 });
    }
    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("ADD ADDRESS ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to add address." }, { status: 500 });
  }
}