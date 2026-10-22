import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!user && !sessionId) {
      return NextResponse.json({ items: [], subtotal: 0, totalItems: 0 });
    }

    const where = user ? { userId: user.id } : { sessionId: sessionId! };

    const cartItems = await prisma.cartItem.findMany({
      where,
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { displayOrder: "asc" } },
            seller: { select: { id: true, storeName: true } },
          },
        },
        variant: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Revalidate live prices and stock! Never trust stale client values.
    let subtotal = 0;
    let totalItems = 0;
    const validatedItems = cartItems.map((item) => {
      const currentPrice = item.variant ? item.variant.price : item.product.basePrice;
      const currentStock = item.variant ? item.variant.stock : item.product.stock;
      const isOutOfStock = currentStock < item.quantity;
      const itemTotal = currentPrice * item.quantity;

      if (!isOutOfStock) {
        subtotal += itemTotal;
      }
      totalItems += item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        title: item.product.title,
        variantTitle: item.variant?.title,
        imageUrl: item.variant?.imageUrl || item.product.images[0]?.url,
        price: currentPrice,
        mrp: item.variant ? item.variant.mrp : item.product.mrp,
        stock: currentStock,
        isOutOfStock,
        seller: item.product.seller,
        itemTotal,
      };
    });

    const freeShippingThreshold = 499.0;
    const standardShippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0.0 : 49.0;
    const finalTotal = subtotal + standardShippingFee;

    return NextResponse.json({
      items: validatedItems,
      subtotal,
      shippingFee: standardShippingFee,
      freeShippingThreshold,
      finalTotal,
      totalItems,
    });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();
    const { productId, variantId, quantity = 1, sessionId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (!user && !sessionId) {
      return NextResponse.json({ error: "User session or guest sessionId required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || product.status !== "APPROVED") {
      return NextResponse.json({ error: "Product not available" }, { status: 404 });
    }

    let availableStock = product.stock;
    let priceAtAdd = product.basePrice;

    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return NextResponse.json({ error: "Variant not found" }, { status: 404 });
      }
      availableStock = variant.stock;
      priceAtAdd = variant.price;
    }

    if (availableStock < quantity) {
      return NextResponse.json(
        { error: `Only ${availableStock} units available in stock` },
        { status: 400 }
      );
    }

    const where = user
      ? { userId: user.id, productId, variantId: variantId || null }
      : { sessionId: sessionId!, productId, variantId: variantId || null };

    const existing = await prisma.cartItem.findFirst({
      where,
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > availableStock) {
        return NextResponse.json(
          { error: `Cannot add more than available stock (${availableStock})` },
          { status: 400 }
        );
      }

      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty, priceAtAdd },
      });
      return NextResponse.json({ success: true, item: updated });
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: user ? user.id : null,
        sessionId: user ? null : sessionId,
        productId,
        variantId: variantId || null,
        quantity,
        priceAtAdd,
      },
    });

    return NextResponse.json({ success: true, item: cartItem }, { status: 201 });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const user = await getSessionUser(req);
    const sessionId = searchParams.get("sessionId");

    if (itemId) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
      return NextResponse.json({ success: true, message: "Item removed" });
    }

    // Clear whole cart
    if (user) {
      await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    } else if (sessionId) {
      await prisma.cartItem.deleteMany({ where: { sessionId } });
    }

    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
