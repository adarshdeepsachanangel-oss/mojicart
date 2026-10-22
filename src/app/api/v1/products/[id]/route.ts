import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin, isSeller } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        variants: true,
        category: {
          include: {
            parent: true,
          },
        },
        brand: true,
        seller: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            rating: true,
            description: true,
            createdAt: true,
          },
        },
        reviews: {
          where: { status: "APPROVED" },
          include: {
            user: { select: { name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product GET by ID error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || (!isSeller(user.role) && !isAdmin(user.role))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check seller ownership unless admin
    if (!isAdmin(user.role) && existingProduct.sellerId !== user.sellerProfile?.id) {
      return NextResponse.json({ error: "You can only update your own products" }, { status: 403 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.basePrice !== undefined) {
      updateData.basePrice = parseFloat(body.basePrice);
      updateData.isUnder199 = updateData.basePrice <= 199;
      updateData.isUnder499 = updateData.basePrice <= 499;
    }
    if (body.mrp !== undefined) updateData.mrp = parseFloat(body.mrp);
    if (updateData.basePrice && updateData.mrp) {
      updateData.discountPercent = Math.round(((updateData.mrp - updateData.basePrice) / updateData.mrp) * 100);
    }
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.highlights !== undefined) updateData.highlights = body.highlights;
    if (body.specs !== undefined) {
      updateData.specs = typeof body.specs === "object" ? JSON.stringify(body.specs) : body.specs;
    }
    if (body.categoryId !== undefined) {
      updateData.categoryId = body.categoryId;
    }
    if (body.status !== undefined && isAdmin(user.role)) {
      updateData.status = body.status;
      if (body.rejectionReason !== undefined) {
        updateData.rejectionReason = body.rejectionReason;
      }
    }
    if (body.isFeatured !== undefined && isAdmin(user.role)) {
      updateData.isFeatured = body.isFeatured;
    }
    if (body.isBestSeller !== undefined && isAdmin(user.role)) {
      updateData.isBestSeller = body.isBestSeller;
    }
    if (body.sourceUrl !== undefined) {
      updateData.sourceUrl = body.sourceUrl;
    }

    if (Array.isArray(body.images) && body.images.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: body.images.map((url: string, index: number) => ({
          productId: id,
          url,
          isPrimary: index === 0,
          displayOrder: index,
        })),
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { images: true, variants: true },
    });

    // Synchronize product variants with updated pricing/stock if modified
    const variantUpdates: any = {};
    if (updateData.basePrice !== undefined) variantUpdates.price = updateData.basePrice;
    if (updateData.mrp !== undefined) variantUpdates.mrp = updateData.mrp;
    if (updateData.stock !== undefined) variantUpdates.stock = updateData.stock;

    if (Object.keys(variantUpdates).length > 0) {
      await prisma.productVariant.updateMany({
        where: { productId: id },
        data: variantUpdates,
      });
    }

    // Purge server route cache so storefront reflects update immediately
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/product/${updated.slug}`);
      revalidatePath(`/product/${updated.id}`);
      revalidatePath("/product/[id]", "page");
      revalidatePath("/admin/products");
      revalidatePath("/");
    } catch (e) {
      // ignore in non-cached dev environments
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || (!isSeller(user.role) && !isAdmin(user.role))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: { select: { id: true }, take: 1 },
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!isAdmin(user.role) && existingProduct.sellerId !== user.sellerProfile?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If product has past customer order items, archive it to preserve order history
    if (existingProduct.orderItems.length > 0) {
      await prisma.product.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
    } else {
      // Hard delete dependent rows and the product
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { productId: id } }),
        prisma.wishlistItem.deleteMany({ where: { productId: id } }),
        prisma.review.deleteMany({ where: { productId: id } }),
        prisma.stockMovement.deleteMany({ where: { productId: id } }),
        prisma.productImage.deleteMany({ where: { productId: id } }),
        prisma.productVariant.deleteMany({ where: { productId: id } }),
        prisma.product.delete({ where: { id } }),
      ]);
    }

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/admin/products");
      revalidatePath("/");
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
