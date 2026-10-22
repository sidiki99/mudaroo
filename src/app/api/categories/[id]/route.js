

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import mongoose from "mongoose";

export async function GET(request,{params}) {
  try {
    const {id} = await params
     
    if(!mongoose.isValidObjectId(id)){
       return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 }
      );
    }
    await connectDB();

    const filteredCategory = await Category.findById(id).lean()
     
        if(!filteredCategory){
          return NextResponse.json(
            {
              success: false,
              message: "Category not found",
            },
            { status: 404 }
          );
     }

    return NextResponse.json(
      {
        success: true,
       
       filteredCategory,
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
