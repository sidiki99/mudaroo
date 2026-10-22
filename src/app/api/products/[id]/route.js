

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import Product from "@/models/Product";

export async function GET(request,{params}) {
  try {
    const {id} = await params
     await connectDB();

     let filteredProduct
     
    if(mongoose.isValidObjectId(id)){
        filteredProduct =  await Product.findById(id).lean()
    }else{
      filteredProduct = await Product.findOne({
      slug: id,
      isActive:true
    }).lean()
    }  
     
        if(!filteredProduct){
          return NextResponse.json(
            {
              success: false,
              message: "Product not found",
            },
            { status: 404 }
          );
     }

    return NextResponse.json(
      {
        success: true,
     
       filteredProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Product",
      },
      { status: 500 }
    );
  }
}
