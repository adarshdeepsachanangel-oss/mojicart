import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isSeller } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isSeller(user.role)) {
      return NextResponse.json({ error: "Unauthorized. Seller account required." }, { status: 403 });
    }

    const seller = user.sellerProfile;
    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    // 1. Fetch seller's order items
    const orderItems = await prisma.orderItem.findMany({
      where: { sellerId: seller.id },
      include: {
        order: { select: { orderNumber: true, orderStatus: true, createdAt: true, customer: { select: { name: true } } } },
        product: { select: { title: true, images: { take: 1 } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalOrders = orderItems.length;
    const grossSales = orderItems.reduce((acc, item) => acc + item.total, 0);
    const totalCommissions = orderItems.reduce((acc, item) => acc + item.commissionAmount, 0);
    const netEarnings = grossSales - totalCommissions;

    const pendingOrders = orderItems.filter((i) => ["CONFIRMED", "PROCESSING", "PACKED"].includes(i.status)).length;
    const completedOrders = orderItems.filter((i) => i.status === "DELIVERED").length;
    const cancelledOrders = orderItems.filter((i) => i.status === "CANCELLED").length;

    // 2. Low-stock products (< 10 units)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        sellerId: seller.id,
        stock: { lte: 15 },
        status: "APPROVED",
      },
      select: {
        id: true,
        title: true,
        sku: true,
        stock: true,
        basePrice: true,
      },
      take: 6,
    });

    // 3. Product catalog count
    const totalProducts = await prisma.product.count({
      where: { sellerId: seller.id },
    });

    return NextResponse.json({
      seller: {
        id: seller.id,
        storeName: seller.storeName,
        status: seller.status,
        rating: seller.rating,
        commissionRate: seller.commissionRate,
      },
      metrics: {
        grossSales: Math.round(grossSales * 100) / 100,
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        netEarnings: Math.round(netEarnings * 100) / 100,
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalProducts,
      },
      lowStockProducts,
      recentItems: orderItems.slice(0, 8),
    });
  } catch (error) {
    console.error("Seller dashboard error:", error);
    return NextResponse.json({ error: "Failed to load seller dashboard" }, { status: 500 });
  }
}
