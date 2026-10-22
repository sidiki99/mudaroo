
import cloudinary from "@/auth/cloudinary";

const folders = {
  category: "mudaroo/categories",
  product: "mudaroo/products",
  brand: "mudaroo/brands",
  avatar: "mudaroo/avatars",
};

export async function uploadImage(file, type = "product") {
  if (!file || typeof file === "string") {
    throw new Error("Please select an image");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only images are allowed");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5 MB");
  }

  const folder = folders[type];

  if (!folder) {
    throw new Error("Invalid image type");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });

  return {
    imageUrl: result.secure_url,
    publicId: result.public_id,
  };
}
