

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({
      isActive: true,
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

        if(!categories){
       throw new Error("NO active category found")
     }

    return NextResponse.json(
      {
        success: true,
        count: categories.length,
        categories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}
