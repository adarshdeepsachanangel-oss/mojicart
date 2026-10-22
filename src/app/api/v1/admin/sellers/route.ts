import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const sellers = await prisma.seller.findMany({
      where: status ? { status } : undefined,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: {
          select: { products: true, orderItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sellers });
  } catch (error) {
    console.error("Admin sellers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { sellerId, status, commissionRate, rejectionReason } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (commissionRate !== undefined) updateData.commissionRate = parseFloat(commissionRate);
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;

    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: updateData,
      include: { user: true },
    });

    // Also update associated user status if suspended
    if (status === "SUSPENDED") {
      await prisma.user.update({
        where: { id: updatedSeller.userId },
        data: { status: "SUSPENDED" },
      });
    } else if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: updatedSeller.userId },
        data: { status: "ACTIVE" },
      });
    }

    return NextResponse.json({ success: true, seller: updatedSeller });
  } catch (error) {
    console.error("Admin sellers PATCH error:", error);
    return NextResponse.json({ error: "Failed to update seller" }, { status: 500 });
  }
}
