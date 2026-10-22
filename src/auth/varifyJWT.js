
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function verifyJWT() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const token =
    cookieStore.get("accessToken")?.value ||
    headerStore
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");

  if (!token) {
    const error = new Error("Unauthorized request");
    error.status = 401;
    throw error;
  }

  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
  } catch {
    const error = new Error("Invalid or expired access token");
    error.status = 401;
    throw error;
  }

  const userId = decoded?._id || decoded?.id;

  if (!userId) {
    const error = new Error("Invalid token payload");
    error.status = 401;
    throw error;
  }

  await connectDB();

  const user = await User.findById(userId).select(
    "-passwordHash -refreshToken"
  );

  if (!user) {
    const error = new Error("User not found");
    error.status = 401;
    throw error;
  }

  return user;
}
