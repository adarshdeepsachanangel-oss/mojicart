import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isSeller } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isSeller(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const seller = user.sellerProfile;
    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    const [settlements, orderItems] = await Promise.all([
      prisma.sellerSettlement.findMany({
        where: { sellerId: seller.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.orderItem.findMany({
        where: { sellerId: seller.id },
        include: {
          order: { select: { orderNumber: true, createdAt: true, paymentStatus: true } },
          product: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const totalGross = orderItems.reduce((acc, i) => acc + i.total, 0);
    const totalCommission = orderItems.reduce((acc, i) => acc + i.commissionAmount, 0);
    const totalPayoutsReceived = settlements
      .filter((s) => s.status === "PAID")
      .reduce((acc, s) => acc + s.netPayout, 0);
    const pendingBalance = Math.max(0, totalGross - totalCommission - totalPayoutsReceived);

    return NextResponse.json({
      summary: {
        totalGross: Math.round(totalGross * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalPayoutsReceived: Math.round(totalPayoutsReceived * 100) / 100,
        pendingBalance: Math.round(pendingBalance * 100) / 100,
        commissionRate: seller.commissionRate,
        bankDetails: {
          bankName: seller.bankName,
          accountNumber: seller.bankAccountNumber ? `••••${seller.bankAccountNumber.slice(-4)}` : null,
          ifsc: seller.bankIfsc,
        },
      },
      settlements,
      recentLedger: orderItems,
    });
  } catch (error) {
    console.error("Seller finance error:", error);
    return NextResponse.json({ error: "Failed to load finance data" }, { status: 500 });
  }
}
