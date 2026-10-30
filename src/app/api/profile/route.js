import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyJWT } from "@/auth/varifyJWT";

// Reads the logged-in user's id from the JWT, or returns a ready-made error response
async function getUserId(request) {
  const decoded = await verifyJWT(request);
  const userId = decoded && (decoded.userId || decoded.id || decoded._id);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return {
      response: NextResponse.json(
        { success: false, message: "Please log in to view your profile." },
        { status: 401 }
      ),
    };
  }
  return { userId };
}

const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  authProvider: u.authProvider,
  addresses: u.addresses || [],
  createdAt: u.createdAt,
});

// GET /api/profile -> the logged-in user's profile
export async function GET(request) {
  try {
    const { userId, response } = await getUserId(request);
    if (response) return response;

    await connectDB();

    // passwordHash and refreshToken are `select: false`, so they are never returned
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to load profile." }, { status: 500 });
  }
}

// PATCH /api/profile   body: { name }
// Email, password, role and auth provider are intentionally NOT editable here.
export async function PATCH(request) {
  try {
    const { userId, response } = await getUserId(request);
    if (response) return response;

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name } },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "Invalid JSON request body." }, { status: 400 });
    }
    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("UPDATE PROFILE ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to update profile." }, { status: 500 });
  }
}