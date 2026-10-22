import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin, isSeller } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const orderNumber = searchParams.get("orderNumber") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    let where: any = {};

    if (isAdmin(user.role)) {
      // Admin sees all
      if (status) where.orderStatus = status;
      if (orderNumber) where.orderNumber = { contains: orderNumber };
    } else if (isSeller(user.role) && user.sellerProfile) {
      // Seller only sees orders that contain their items! Data isolation!
      where = {
        items: {
          some: {
            sellerId: user.sellerProfile.id,
          },
        },
      };
      if (status) where.orderStatus = status;
      if (orderNumber) where.orderNumber = { contains: orderNumber };
    } else {
      // Regular customer only sees their own orders
      where = { customerId: user.id };
      if (status) where.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  images: { take: 1, orderBy: { displayOrder: "asc" } },
                },
              },
              seller: { select: { id: true, storeName: true } },
            },
          },
          statusHistory: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    // If user is a seller, filter the order items so they ONLY see their own items and payouts
    const safeOrders = orders.map((o) => {
      let filteredItems = o.items;
      if (isSeller(user.role) && !isAdmin(user.role) && user.sellerProfile) {
        filteredItems = o.items.filter((item) => item.sellerId === user.sellerProfile?.id);
      }
      return {
        ...o,
        items: filteredItems,
      };
    });

    return NextResponse.json({
      orders: safeOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
