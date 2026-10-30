import { NextResponse } from "next/server";
import { verifyJWT } from "@/auth/varifyJWT";

/**
 * Returns { decoded } when the caller is an admin,
 * or { response } (a ready-made 401/403 NextResponse) when they are not.
 *
 * Assumes your JWT payload contains `role: "admin"`.
 * If your token has no role, look the user up here instead:
 *   const user = await User.findById(decoded.userId || decoded.id || decoded._id);
 *   if (user?.role !== "admin") ...
 */
export async function requireAdmin(request) {
  const decoded = await verifyJWT(request);

  if (!decoded) {
    return {
      response: NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      ),
    };
  }

  if (decoded.role !== "admin") {
    return {
      response: NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { decoded };
}