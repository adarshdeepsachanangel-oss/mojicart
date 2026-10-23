import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin, isSeller } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
              },
            },
            seller: {
              select: { id: true, storeName: true, storeSlug: true },
            },
          },
        },
        statusHistory: { orderBy: { createdAt: "desc" } },
        payments: true,
        refunds: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If not logged in, allow tracking only if querying by exact orderNumber
    if (!user) {
      if (order.orderNumber !== id && order.id !== id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Return tracking view for guests
      return NextResponse.json({ order });
    }

    // Role check: Admin can view all. Customer only view own. Seller only view if they have items.
    if (!isAdmin(user.role)) {
      if (user.role === "CUSTOMER" && order.customerId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (isSeller(user.role)) {
        const hasSellerItem = order.items.some((i) => i.sellerId === user.sellerProfile?.id);
        if (!hasSellerItem) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        // Filter out other sellers' items
        order.items = order.items.filter((i) => i.sellerId === user.sellerProfile?.id);
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order GET by ID error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      status,
      comment,
      trackingNumber,
      shippingCarrier,
      paymentStatus,
      estimatedDeliveryDate,
    } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // State transition permissions
    const isSuperOrOps = isAdmin(user.role);
    const isOrderSeller = isSeller(user.role) && order.items.some((i) => i.sellerId === user.sellerProfile?.id);
    const isOrderCustomer = user.id === order.customerId;

    // Customer can only request cancellation if order is not yet shipped
    if (isOrderCustomer && !isSuperOrOps && !isOrderSeller) {
      if (status && status !== "CANCELLED") {
        return NextResponse.json({ error: "Customers can only cancel eligible orders" }, { status: 403 });
      }
      if (["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)) {
        return NextResponse.json({ error: "Order is already in transit and cannot be cancelled" }, { status: 400 });
      }
    } else if (!isSuperOrOps && !isOrderSeller) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetStatus = status || order.orderStatus;

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (status) updateData.orderStatus = status;
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (shippingCarrier !== undefined) updateData.shippingCarrier = shippingCarrier;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (estimatedDeliveryDate) updateData.estimatedDeliveryDate = new Date(estimatedDeliveryDate);

      // If delivered, mark payment as PAID if it was COD
      if (targetStatus === "DELIVERED" && order.paymentMethod === "COD") {
        updateData.paymentStatus = "PAID";
      }

      // If cancelled, restore stock!
      if (targetStatus === "CANCELLED" && order.orderStatus !== "CANCELLED") {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              totalSold: { decrement: item.quantity },
            },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              changeQty: item.quantity,
              reason: "ORDER_CANCELLED",
              referenceType: "ORDER",
              referenceId: order.id,
            },
          });
        }
      }

      const res = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          items: true,
          statusHistory: { orderBy: { createdAt: "desc" } },
        },
      });

      if (status && status !== order.orderStatus) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.orderStatus,
            toStatus: status,
            changedByUserId: user.id,
            comment: comment || `Status updated to ${status} by ${user.name} (${user.role})`,
          },
        });
      } else if (comment || trackingNumber || shippingCarrier) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.orderStatus,
            toStatus: order.orderStatus,
            changedByUserId: user.id,
            comment: comment || `Logistics updated: Carrier ${shippingCarrier || order.shippingCarrier || "Courier"}, AWB #${trackingNumber || order.trackingNumber || "N/A"}`,
          },
        });
      }

      return res;
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Order PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
