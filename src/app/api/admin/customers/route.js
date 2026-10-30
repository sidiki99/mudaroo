import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { requireAdmin } from "@/app/admin/requireAdmin/route";

// GET /api/admin/customers  -> all customers + their order count and total spent (admin only)
export async function GET(request) {
  try {
    const { response } = await requireAdmin(request);
    if (response) return response;

    await connectDB();

    const [users, stats] = await Promise.all([
      // passwordHash and refreshToken are `select: false` in your schema, so they are never returned
      User.find({ role: "customer" }).sort({ createdAt: -1 }).lean(),
      Order.aggregate([
        {
          $group: {
            _id: "$user",
            totalOrders: { $sum: 1 },
            // cancelled orders don't count as money spent
            totalSpent: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 0, "$total"] },
            },
          },
        },
      ]),
    ]);

    const statMap = Object.fromEntries(stats.map((s) => [String(s._id), s]));

    const customers = users.map((u) => {
      const s = statMap[String(u._id)];
      const addresses = u.addresses || [];
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: addresses.find((a) => a.phone)?.phone || "",
        cities: [...new Set(addresses.map((a) => a.city).filter(Boolean))],
        authProvider: u.authProvider,
        isActive: u.isActive !== false, // customers are active unless explicitly deactivated
        createdAt: u.createdAt,
        totalOrders: s?.totalOrders || 0,
        totalSpent: s?.totalSpent || 0,
      };
    });

    return NextResponse.json({ success: true, count: customers.length, customers });
  } catch (error) {
    console.error("ADMIN GET CUSTOMERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers." },
      { status: 500 }
    );
  }
}