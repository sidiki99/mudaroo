import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyJWT } from "@/auth/varifyJWT";
import { validateAddress } from "@/lib/validateAddress";

async function authenticate(request, addressId) {
  const decoded = await verifyJWT(request);
  const userId = decoded && (decoded.userId || decoded.id || decoded._id);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return {
      response: NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      ),
    };
  }
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    return {
      response: NextResponse.json(
        { success: false, message: "Invalid address ID." },
        { status: 400 }
      ),
    };
  }
  return { userId };
}

// Next.js 15+: params is a Promise. On Next 14 use `{ params }` and `params.addressId`.

// PUT /api/profile/addresses/:addressId -> edit one of the user's addresses
export async function PUT(request, { params }) {
  try {
    const { addressId } = await params;
    const { userId, response } = await authenticate(request, addressId);
    if (response) return response;

    const { data, error } = validateAddress(await request.json());
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    await connectDB();

    const $set = {};
    for (const [key, value] of Object.entries(data)) {
      $set[`addresses.$.${key}`] = value;
    }

    // The filter guarantees users can only edit their OWN addresses
    const user = await User.findOneAndUpdate(
      { _id: userId, "addresses._id": addressId },
      { $set },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "Address not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Address updated.", addresses: user.addresses });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "Invalid JSON request body." }, { status: 400 });
    }
    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("UPDATE ADDRESS ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to update address." }, { status: 500 });
  }
}

// DELETE /api/profile/addresses/:addressId -> remove one of the user's addresses
export async function DELETE(request, { params }) {
  try {
    const { addressId } = await params;
    const { userId, response } = await authenticate(request, addressId);
    if (response) return response;

    await connectDB();

    const user = await User.findOneAndUpdate(
      { _id: userId, "addresses._id": addressId },
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "Address not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Address deleted.", addresses: user.addresses });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to delete address." }, { status: 500 });
  }
}