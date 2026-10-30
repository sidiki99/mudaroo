import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import Product from "@/models/Product";


const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);


// Next.js 15+: params is a Promise. On Next 14, use `{ params }` and `params.id` directly.
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

   if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    const formData = await request.formData();

    const name = formData.get("name")?.trim();
    const slug = formData.get("slug")?.trim().toLowerCase();
    const description = formData.get("description")?.trim() || "";
    const parent = formData.get("parent") || null;
    const sortOrder = Number(formData.get("sortOrder") || 0);
    const isActive = formData.get("isActive") !== "false";
    const imageFile = formData.get("image");

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

    const duplicate = await Category.findOne({ slug, _id: { $ne: id } });
    if (duplicate) {
      return NextResponse.json(
        { message: "This category slug already exists" },
        { status: 409 }
      );
    }

    if (parent) {
      if (!isObjectId(parent) || parent === id) {
        return NextResponse.json({ message: "Invalid parent category" }, { status: 400 });
      }
      if (!(await Category.findById(parent))) {
        return NextResponse.json({ message: "Parent category not found" }, { status: 404 });
      }
    }

    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      const uploaded = await uploadImage(imageFile, "category");
      category.image = uploaded.imageUrl;
    }

    category.name = name;
    category.slug = slug;
    category.description = description;
    category.parent = parent;
    category.sortOrder = sortOrder;
    category.isActive = isActive;

    await category.save();

    return NextResponse.json({ message: "Category updated successfully", category });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "This category slug already exists" },
        { status: 409 }
      );
    }
    console.error("Update category error:", error);
    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
  }
}


export async function DELETE(_request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!isObjectId(id)) {
      return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
    }

    const [productCount, childCount] = await Promise.all([
      Product.countDocuments({ category: id }), // change field name if different
      Category.countDocuments({ parent: id }),
    ]);

    if (productCount > 0) {
      return NextResponse.json(
        { message: `This category has ${productCount} product(s). Move or delete them first.` },
        { status: 409 }
      );
    }
    if (childCount > 0) {
      return NextResponse.json(
        { message: "This category has sub-categories. Delete or move them first." },
        { status: 409 }
      );
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  }
}