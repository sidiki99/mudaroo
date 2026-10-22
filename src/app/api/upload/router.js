
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/uploadImage";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const file = formData.get("image");
    const type = formData.get("type");

    const allowedTypes = [
      "category",
      "product",
      "brand",
      "avatar",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { message: "Invalid image type" },
        { status: 400 }
      );
    }

    const image = await uploadImage(file, type);

    return NextResponse.json(
      {
        message: "Image uploaded successfully",
        image,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { message: error.message || "Image upload failed" },
      { status: 400 }
    );
  }
}
