import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin, isSeller } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const isUnder199 = searchParams.get("under199") === "true";
    const isUnder499 = searchParams.get("under499") === "true";
    const isFeatured = searchParams.get("featured") === "true";
    const isBestSeller = searchParams.get("bestSeller") === "true";
    const sellerId = searchParams.get("sellerId") || undefined;
    const sort = searchParams.get("sort") || "relevance";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const statusParam = searchParams.get("status");
    const where: any = {};
    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam;
    } else if (statusParam === "ALL") {
      where.status = { not: "ARCHIVED" };
    } else if (!statusParam) {
      where.status = "APPROVED";
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (category) {
      where.OR = [
        { category: { slug: category } },
        { category: { parent: { slug: category } } },
      ];
    }

    if (brand) {
      where.brand = { slug: brand };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    if (isUnder199) where.isUnder199 = true;
    if (isUnder499) where.isUnder499 = true;
    if (isFeatured) where.isFeatured = true;
    if (isBestSeller) where.isBestSeller = true;

    // Sorting logic
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { basePrice: "asc" };
    else if (sort === "price_desc") orderBy = { basePrice: "desc" };
    else if (sort === "rating") orderBy = { rating: "desc" };
    else if (sort === "popular") orderBy = { totalSold: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { displayOrder: "asc" } },
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, storeName: true, storeSlug: true, rating: true } },
          variants: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || (!isSeller(user.role) && !isAdmin(user.role))) {
      return NextResponse.json({ error: "Unauthorized. Seller account required." }, { status: 403 });
    }

    const sellerId = user.sellerProfile?.id;
    if (!sellerId && !isAdmin(user.role)) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 400 });
    }

    const body = await req.json();
    const {
      title,
      description,
      categoryId,
      brandId,
      basePrice,
      mrp,
      sku,
      stock,
      images = [],
      variants = [],
      highlights,
      specs,
      taxRate = 18.0,
      returnPolicyDays = 7,
    } = body;

    if (!title || !categoryId || !basePrice || !mrp || !sku) {
      return NextResponse.json(
        { error: "Required fields missing: title, category, price, MRP, and SKU" },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(basePrice);
    const parsedMrp = parseFloat(mrp);
    const discount = parsedMrp > parsedPrice ? Math.round(((parsedMrp - parsedPrice) / parsedMrp) * 100) : 0;

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        slug,
        description: description || "",
        categoryId,
        brandId: brandId || null,
        sellerId: sellerId || (await prisma.seller.findFirst())?.id!,
        status: isAdmin(user.role) ? "APPROVED" : "PENDING_APPROVAL",
        basePrice: parsedPrice,
        mrp: parsedMrp,
        discountPercent: discount,
        taxRate: parseFloat(taxRate),
        sku: sku.trim().toUpperCase(),
        stock: parseInt(stock || "0"),
        isUnder199: parsedPrice <= 199,
        isUnder499: parsedPrice <= 499,
        highlights: highlights || null,
        specs: typeof specs === "object" ? JSON.stringify(specs) : specs || null,
        returnPolicyDays: parseInt(returnPolicyDays || "7"),
        images: {
          create: images.map((url: string, index: number) => ({
            url,
            isPrimary: index === 0,
            displayOrder: index,
          })),
        },
        variants: {
          create: variants.map((v: any, index: number) => ({
            sku: `${sku.trim().toUpperCase()}-V${index + 1}`,
            title: v.title || `Variant ${index + 1}`,
            price: parseFloat(v.price || parsedPrice),
            mrp: parseFloat(v.mrp || parsedMrp),
            stock: parseInt(v.stock || "0"),
            attributes: typeof v.attributes === "object" ? JSON.stringify(v.attributes) : v.attributes || null,
          })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("Product create error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Product SKU or slug must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
