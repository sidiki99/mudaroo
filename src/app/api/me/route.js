


import { verifyJWT } from "@/auth/varifyJWT";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await verifyJWT();

    return NextResponse.json(
      {
        success: true,
        message: "User fetched successfully",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Current user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch current user",
      },
      { status: error.status || 500 }
    );
  }
}
