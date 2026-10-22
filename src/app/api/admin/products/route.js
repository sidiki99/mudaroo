
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { uploadImage } from "@/lib/uploadImage";
import cloudinary from "@/auth/cloudinary";



export async function POST(request) {
  const uploadedImages = [];

  try {
    await connectDB();

    const formData = await request.formData();

    // 1. Get product fields
    const name = formData.get("name")?.trim();
    const slug = formData.get("slug")?.trim().toLowerCase();
    const description = formData.get("description")?.trim();
    const audience = formData.get("audience");
    const category = formData.get("category");
    const brand = formData.get("brand")?.trim() || "";
    const material = formData.get("material")?.trim() || "";
    const isActive = formData.get("isActive") ?? "true";
    const isFeatured = formData.get("isFeatured") ?? "false";


  

    // Send variants as a JSON string in form-data
    let variants;

    try {
      variants = JSON.parse(formData.get("variants") || "[]");
    } catch {
      return NextResponse.json(
        { message: "Variants must contain valid JSON" },
        { status: 400 }
      );
    }

    // 2. Validate required fields
    if (!name || !slug || !description || !audience || !category) {
      return NextResponse.json(
        {
          message:
            "Name, slug, description, audience, and category are required",
        },
        { status: 400 }
      );
    }

    if (!["true", "false"].includes(String(isActive)) ||
        !["true", "false"].includes(String(isFeatured))) {
      return NextResponse.json(
        { message: "isActive and isFeatured must be true or false" },
        { status: 400 }
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { message: "At least one product variant is required" },
        { status: 400 }
      );
    }

    // 3. Validate category ID
    if (!mongoose.isValidObjectId(category)) {
      return NextResponse.json(
        { message: "Invalid category ID" },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // 4. Check for duplicate product slug
    const existingProduct = await Product.findOne({ slug });

    if (existingProduct) {
      return NextResponse.json(
        { message: "This product slug already exists" },
        { status: 409 }
      );
    }

    // 5. Get multiple image files
    const imageFiles = formData.getAll("images");

    const validFiles = imageFiles.filter(
      (file) =>
        typeof file !== "string" &&
        file.size > 0
    );

    if (validFiles.length === 0) {
      return NextResponse.json(
        { message: "At least one product image is required" },
        { status: 400 }
      );
    }

    if (validFiles.length > 8) {
      return NextResponse.json(
        { message: "You can upload a maximum of 8 images" },
        { status: 400 }
      );
    }

    // 6. Upload images to Cloudinary
    for (const file of validFiles) {
      const result = await uploadImage(file, "product");

      uploadedImages.push(result);
    }

    const imageUrls = uploadedImages.map(
      (image) => image.imageUrl
    );

    // 7. Create product in MongoDB
    const product = await Product.create({
      name,
      slug,
      description,
      audience,
      category,
      brand,
      images: imageUrls,
      material,
      variants,
      isActive: isActive === "true",
      isFeatured: isFeatured === "true",
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    // 8. Remove uploaded images if product creation fails
    for (const image of uploadedImages) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cleanupError) {
        console.error(
          "Failed to remove Cloudinary image:",
          cleanupError
        );
      }
    }

    // if (error.code === 11000) {
    //   return NextResponse.json(
    //     { message: "Product slug or another unique value already exists" },
    //     { status: 409 }
    //   );
    // }

    if (error.code === 11000) {
  console.error("Duplicate field:", error.keyValue);

  return NextResponse.json(
    {
      message: "Duplicate value exists",
      duplicateField: error.keyValue,
    },
    { status: 409 }
  );
}

    if (error.name === "ValidationError" ||
        error.name === "CastError") {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    console.error("Create product error:", error);

    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}
