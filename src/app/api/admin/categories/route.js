
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { uploadImage } from "@/lib/uploadImage";


export async function POST(request) {
  let uploadedImage = null;

  try {
    await connectDB();

    const formData = await request.formData();

    const name = formData.get("name")?.trim();
    const slug = formData.get("slug")?.trim().toLowerCase();
    const description = formData.get("description")?.trim() || "";
    const parent = formData.get("parent") || null;
    const sortOrder = Number(formData.get("sortOrder") || 0);
    const isActive = formData.get("isActive") !== "false";
    const imageFile = formData.get("image");

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { message: "Category name and slug are required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return NextResponse.json(
        { message: "Sort order must be a non-negative integer" },
        { status: 400 }
      );
    }

    // Check whether the slug already exists
    const existingCategory = await Category.findOne({ slug });

    if (existingCategory) {
      return NextResponse.json(
        { message: "This category slug already exists" },
        { status: 409 }
      );
    }

    // Validate parent category if provided
    if (parent) {
      if (!/^[0-9a-fA-F]{24}$/.test(parent)) {
        return NextResponse.json(
          { message: "Invalid parent category ID" },
          { status: 400 }
        );
      }

      const parentCategory = await Category.findById(parent);

      if (!parentCategory) {
        return NextResponse.json(
          { message: "Parent category not found" },
          { status: 404 }
        );
      }
    }

    // Upload image only if one was provided
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      uploadedImage = await uploadImage(imageFile, "category");
    }

    // Create category in MongoDB
    const category = await Category.create({
      name,
      slug,
      description,
      image: uploadedImage?.imageUrl || "",
      parent,
      isActive,
      sortOrder,
    });

    return NextResponse.json(
      {
        message: "Category created successfully",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    // Remove uploaded image if database creation fails
    if (uploadedImage?.publicId) {
      try {
        const cloudinary = (await import("@/auth/cloudinary")).default;
        await cloudinary.uploader.destroy(uploadedImage.publicId);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup error:", cleanupError);
      }
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { message: "This category slug already exists" },
        { status: 409 }
      );
    }

    console.error("Create category error:", error);

    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}
