

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({
        isFeatured: true,
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

        if(!products){
       throw new Error("NO featured product  found")
     }

    return NextResponse.json(
      {
        success: true,
        count:products.length,
       products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch featured products",
      },
      { status: 500 }
    );
  }
}
