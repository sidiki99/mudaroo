
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Order from "@/models/Order";
import User from "@/models/User";

// export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({
        success: true,
        query: "",
        results: {
          products: [],
          categories: [],
          orders: [],
          customers: [],
        },
      });
    }

    // Escape special regex characters in the search text.
    const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safeQ, "i");

    const [products, categories, orders, customers] =
      await Promise.all([
        Product.find({
          isActive: true,
          $or: [
            { name: regex },
            { slug: regex },
            { brand: regex },
            { description: regex },
          ],
        })
          .select("name slug brand images variants")
          .limit(10)
          .lean(),

        Category.find({
          isActive: true,
          $or: [
            { name: regex },
            { slug: regex },
            { description: regex },
          ],
        })
          .select("name slug image")
          .limit(10)
          .lean(),

        // Search orders by order number.
        Order.find({
          $or: [
            { orderNumber: regex },
            { orderNo: regex },
          ],
        })
          .select("orderNumber orderNo orderStatus total createdAt")
          .limit(10)
          .lean(),

        // Search customers by name or email.
        User.find({
          role: "customer",
          $or: [
            { name: regex },
            { email: regex },
          ],
        })
          .select("name email")
          .limit(10)
          .lean(),
      ]);

    return NextResponse.json({
      success: true,
      query: q,
      results: {
        products,
        categories,
        orders,
        customers,
      },
    });
  } catch (error) {
    console.error("Global search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to search right now.",
      },
      { status: 500 }
    );
  }
}
