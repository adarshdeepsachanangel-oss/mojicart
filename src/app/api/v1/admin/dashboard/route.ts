import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const [
      orders,
      totalCustomers,
      sellers,
      totalProducts,
      pendingProducts,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.findMany({
        include: { items: true, customer: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.seller.findMany({ include: { user: { select: { email: true, phone: true } } } }),
      prisma.product.count(),
      prisma.product.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.product.findMany({
        where: { stock: { lte: 15 }, status: "APPROVED" },
        select: { id: true, title: true, sku: true, stock: true, basePrice: true },
        take: 5,
      }),
    ]);

    const totalOrders = orders.length;
    const gmv = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const completedOrders = orders.filter((o) => o.orderStatus === "DELIVERED").length;
    const pendingOrders = orders.filter((o) => ["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED"].includes(o.orderStatus)).length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === "CANCELLED").length;

    // Platform commission earned
    let totalPlatformCommission = 0;
    for (const o of orders) {
      for (const item of o.items) {
        if (o.orderStatus !== "CANCELLED") {
          totalPlatformCommission += item.commissionAmount;
        }
      }
    }

    const activeSellers = sellers.filter((s) => s.status === "APPROVED").length;
    const pendingSellers = sellers.filter((s) => s.status === "PENDING").length;

    return NextResponse.json({
      metrics: {
        gmv: Math.round(gmv * 100) / 100,
        netSales: Math.round((gmv - (orders.filter((o) => o.orderStatus === "CANCELLED").reduce((a, b) => a + b.totalAmount, 0))) * 100) / 100,
        totalPlatformCommission: Math.round(totalPlatformCommission * 100) / 100,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalCustomers,
        activeSellers,
        pendingSellers,
        totalProducts,
        pendingProducts,
      },
      lowStockProducts,
      recentOrders: orders.slice(0, 10),
      sellersSummary: sellers.slice(0, 8),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: "Failed to load admin dashboard" }, { status: 500 });
  }
}
