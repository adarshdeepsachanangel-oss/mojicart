import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "No products selected. Please select at least one product." },
        { status: 400 }
      );
    }

    if (!["APPROVE", "UNPUBLISH", "DELETE"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Supported actions are APPROVE, UNPUBLISH, DELETE." },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      const res = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          status: "APPROVED",
          rejectionReason: null,
        },
      });

      triggerRevalidation();

      return NextResponse.json({
        success: true,
        action: "APPROVE",
        count: res.count,
        message: `Successfully approved and published ${res.count} product${res.count === 1 ? "" : "s"}.`,
      });
    }

    if (action === "UNPUBLISH") {
      const res = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          status: "DRAFT",
        },
      });

      triggerRevalidation();

      return NextResponse.json({
        success: true,
        action: "UNPUBLISH",
        count: res.count,
        message: `Successfully unpublished ${res.count} product${res.count === 1 ? "" : "s"} to draft.`,
      });
    }

    if (action === "DELETE") {
      // Find products and check for order history
      const prods = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          _count: { select: { orderItems: true } },
        },
      });

      const withOrders = prods.filter((p) => p._count.orderItems > 0).map((p) => p.id);
      const withoutOrders = prods.filter((p) => p._count.orderItems === 0).map((p) => p.id);

      let archivedCount = 0;
      let deletedCount = 0;

      if (withOrders.length > 0) {
        const archRes = await prisma.product.updateMany({
          where: { id: { in: withOrders } },
          data: { status: "ARCHIVED" },
        });
        archivedCount = archRes.count;
      }

      if (withoutOrders.length > 0) {
        await prisma.$transaction([
          prisma.cartItem.deleteMany({ where: { productId: { in: withoutOrders } } }),
          prisma.wishlistItem.deleteMany({ where: { productId: { in: withoutOrders } } }),
          prisma.review.deleteMany({ where: { productId: { in: withoutOrders } } }),
          prisma.stockMovement.deleteMany({ where: { productId: { in: withoutOrders } } }),
          prisma.productImage.deleteMany({ where: { productId: { in: withoutOrders } } }),
          prisma.productVariant.deleteMany({ where: { productId: { in: withoutOrders } } }),
          prisma.product.deleteMany({ where: { id: { in: withoutOrders } } }),
        ]);
        deletedCount = withoutOrders.length;
      }

      triggerRevalidation();

      const totalCount = archivedCount + deletedCount;
      return NextResponse.json({
        success: true,
        action: "DELETE",
        count: totalCount,
        message: `Successfully deleted ${totalCount} product${totalCount === 1 ? "" : "s"}.`,
      });
    }

    return NextResponse.json({ error: "Unhandled action" }, { status: 400 });
  } catch (error: any) {
    console.error("Bulk products action error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process bulk action." },
      { status: 500 }
    );
  }
}

async function triggerRevalidation() {
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/products");
    revalidatePath("/");
  } catch (e) {
    // Ignore cache errors in local dev
  }
}
