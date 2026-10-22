import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit a review" }, { status: 401 });
    }

    const { productId, rating, title, comment, images } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: "Product ID, rating (1-5), and written comment are required" },
        { status: 400 }
      );
    }

    // Verify whether this customer has purchased and received this product!
    const verifiedOrder = await prisma.order.findFirst({
      where: {
        customerId: user.id,
        orderStatus: "DELIVERED",
        items: {
          some: { productId },
        },
      },
    });

    const isVerifiedPurchase = !!verifiedOrder;

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        title: title || null,
        comment: comment.trim(),
        images: images ? JSON.stringify(images) : null,
        isVerifiedPurchase,
        status: "APPROVED",
      },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });

    // Recalculate average product rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      select: { rating: true },
    });

    const newAvg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(newAvg * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
