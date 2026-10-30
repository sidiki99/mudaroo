
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";


// GET /api/admin/revenue?days=7
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url);
    const requestedDays = Number(searchParams.get("days") || 7);

    // Validate requested date range.
    const allowedDays = [7, 30, 90, 365];
    const days = allowedDays.includes(requestedDays)
      ? requestedDays
      : 7;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "paid",
          orderStatus: {
            $nin: ["cancelled", "returned"],
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          revenue: { $sum: "$total" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
        },
      },
    ]);

    // Include dates with zero revenue for a continuous chart.
    const revenueMap = new Map(
      revenueData.map((item) => [item.date, item.revenue])
    );

    const data = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      data.push({
        date: dateKey,
        revenue: revenueMap.get(dateKey) || 0,
      });
    }

    const totalRevenue = data.reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    return NextResponse.json({
      success: true,
      days,
      totalRevenue,
      data,
    });
  } catch (error) {
    console.error("Revenue API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch revenue data",
      },
      { status: 500 }
    );
  }
}
