import prisma from "@/lib/prisma";
import type { NormalizedMeeshoProduct } from "./normalizer";
import { downloadAndStoreImage } from "./imageDownloader";
import { detectDuplicate } from "./duplicateDetector";

export interface SaveProductOptions {
  status?: "DRAFT" | "APPROVED";
  categoryId?: string;
  sellerId?: string;
  customSellingPrice?: number;
  customMrp?: number;
  customTitle?: string;
  customDescription?: string;
  selectedImages?: string[]; // Allowed to filter or reorder images
  isFeatured?: boolean;
  isBestSeller?: boolean;
  jobId?: string;
  allowUpdateDuplicate?: boolean;
  variants?: Array<{
    sku?: string;
    title: string;
    size?: string;
    price: number;
    mrp: number;
    stock: number;
    attributes?: any;
    imageUrl?: string;
  }>;
}

export async function saveImportedMeeshoProduct(
  normalized: NormalizedMeeshoProduct,
  options: SaveProductOptions = {}
) {
  // 1. Resolve Category
  let categoryId = options.categoryId;
  if (!categoryId) {
    const defaultCat = await prisma.category.findFirst({
      where: { isActive: true },
      orderBy: { level: "asc" },
    });
    if (!defaultCat) {
      throw new Error("No category found in database. Please create a category first.");
    }
    categoryId = defaultCat.id;
  }

  // 2. Resolve Seller
  let sellerId = options.sellerId;
  if (!sellerId) {
    const defaultSeller = await prisma.seller.findFirst({
      where: { status: "APPROVED" },
    }) || await prisma.seller.findFirst();

    if (!defaultSeller) {
      throw new Error("No seller found in database. Please register a seller first.");
    }
    sellerId = defaultSeller.id;
  }

  // 3. Pricing
  const basePrice =
    options.customSellingPrice !== undefined && options.customSellingPrice > 0
      ? options.customSellingPrice
      : normalized.pricing.sourcePrice > 0
      ? normalized.pricing.sourcePrice
      : 299;

  let mrp =
    options.customMrp !== undefined && options.customMrp > 0
      ? options.customMrp
      : normalized.pricing.sourceMrp > 0
      ? normalized.pricing.sourceMrp
      : Math.round(basePrice * 1.3);

  if (mrp < basePrice) mrp = Math.round(basePrice * 1.25);

  const discountPercent =
    mrp > basePrice ? Math.round(((mrp - basePrice) / mrp) * 100) : 0;

  // 4. Titles & Description
  const title = (options.customTitle || normalized.title).trim();
  const description = (options.customDescription || normalized.description).trim();
  const status = options.status || "DRAFT";

  // 5. Image Processing
  const imagesToProcess =
    options.selectedImages && options.selectedImages.length > 0
      ? options.selectedImages
      : normalized.images.length > 0
      ? normalized.images
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"];

  const storedImages: { url: string; isPrimary: boolean; displayOrder: number }[] = [];

  for (let i = 0; i < imagesToProcess.length; i++) {
    const rawUrl = imagesToProcess[i];
    let finalUrl = rawUrl;

    // Only download if it's an external remote HTTP URL and not already local /uploads/
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      const downloadRes = await downloadAndStoreImage(rawUrl, `mee_${normalized.sourceProductId}`);
      if (downloadRes.success) {
        finalUrl = downloadRes.storedUrl;
      }
    }

    storedImages.push({
      url: finalUrl,
      isPrimary: i === 0,
      displayOrder: i + 1,
    });
  }

  // 6. Duplicate check & Update Handling
  const duplicateCheck = await detectDuplicate(
    normalized.sourceUrl,
    normalized.sourceProductId
  );

  if (duplicateCheck.isDuplicate && duplicateCheck.existingProduct) {
    if (options.allowUpdateDuplicate === false) {
      throw new Error(
        `Duplicate product already exists: "${duplicateCheck.existingProduct.title}" (SKU: ${duplicateCheck.existingProduct.sku}).`
      );
    }

    const existing = duplicateCheck.existingProduct;

    // Update images in database according to user's gallery order
    if (storedImages.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.createMany({
        data: storedImages.map((img) => ({
          ...img,
          productId: existing.id,
        })),
      });
    }

    // Update existing product with refreshed content, pricing, and category
    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: {
        title,
        description,
        basePrice,
        mrp,
        discountPercent,
        categoryId,
        status,
        isUnder199: basePrice <= 199,
        isUnder499: basePrice <= 499,
        sourcePrice: normalized.pricing.sourcePrice,
        sourceMrp: normalized.pricing.sourceMrp,
        sourceRating: normalized.ratings.score,
        sourceReviewCount: normalized.ratings.reviewCount,
        sourceData: JSON.stringify(normalized.rawSourceData),
        importJobId: options.jobId || undefined,
        specs: JSON.stringify(normalized.specs),
        highlights: normalized.highlights.join("\n"),
      },
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        category: true,
        variants: true,
      },
    });

    // Update variants to preserve individual variation prices
    const variantsToUpdate =
      options.variants && options.variants.length > 0
        ? options.variants
        : normalized.variants && normalized.variants.length > 0
        ? normalized.variants
        : null;

    if (variantsToUpdate && variantsToUpdate.length > 0) {
      await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
      await prisma.productVariant.createMany({
        data: variantsToUpdate.map((v: any, idx: number) => ({
          productId: existing.id,
          sku: v.sku || `MEE-${normalized.sourceProductId}-V${idx + 1}`,
          title: v.title || (v.size ? `Size: ${v.size}` : "Free Size"),
          price: parseFloat(String(v.price ?? v.customPrice ?? basePrice)) || basePrice,
          mrp: parseFloat(String(v.mrp ?? v.customMrp ?? mrp)) || mrp,
          stock: parseInt(String(v.stock ?? 50)) || 50,
          attributes: typeof v.attributes === "string" ? v.attributes : JSON.stringify(v.attributes || { Size: v.size || v.title || "Free Size" }),
          imageUrl: v.imageUrl || null,
        })),
      });
    } else {
      await prisma.productVariant.updateMany({
        where: { productId: existing.id },
        data: {
          price: basePrice,
          mrp: mrp,
        },
      });
    }

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/product/${updated.slug}`);
      revalidatePath(`/product/${updated.id}`);
      revalidatePath("/admin/products");
      revalidatePath("/admin/imports/meesho");
      revalidatePath("/");
    } catch (e) {}

    return { product: updated, isUpdate: true };
  }

  // 7. Base Slug & SKU
  const baseSlug = (normalized.slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  const sku = `MEE-${normalized.sourceProductId.toUpperCase()}`;

  // 8. Database Transaction / Insertion
  const variantsList =
    options.variants && options.variants.length > 0
      ? options.variants
      : normalized.variants.length > 0
      ? normalized.variants
      : [{ title: "Free Size", size: "Free Size", price: basePrice, mrp: mrp, stock: 50 }];

  const product = await prisma.product.create({
    data: {
      title,
      slug,
      description,
      categoryId,
      sellerId,
      status,
      basePrice,
      mrp,
      discountPercent,
      taxRate: 18.0,
      sku,
      stock: 50,
      isFeatured: options.isFeatured || false,
      isBestSeller: options.isBestSeller || false,
      isUnder199: basePrice <= 199,
      isUnder499: basePrice <= 499,
      rating: normalized.ratings.score || 0.0,
      reviewCount: normalized.ratings.reviewCount || 0,
      highlights: normalized.highlights.length > 0 ? normalized.highlights.join("\n") : null,
      specs: JSON.stringify(normalized.specs),
      returnPolicyDays: 7,
      importSource: "MEESHO",
      sourceUrl: normalized.sourceUrl,
      sourceProductId: normalized.sourceProductId,
      sourcePrice: normalized.pricing.sourcePrice,
      sourceMrp: normalized.pricing.sourceMrp,
      sourceRating: normalized.ratings.score,
      sourceReviewCount: normalized.ratings.reviewCount,
      sourceData: JSON.stringify(normalized.rawSourceData),
      importJobId: options.jobId || null,
      images: {
        create: storedImages,
      },
      variants: {
        create: variantsList.map((v: any, idx) => ({
          sku: v.sku || `${sku}-V${idx + 1}`,
          title: v.title || (v.size ? `Size: ${v.size}` : "Free Size"),
          price: parseFloat(String(v.price ?? v.customPrice ?? basePrice)) || basePrice,
          mrp: parseFloat(String(v.mrp ?? v.customMrp ?? mrp)) || mrp,
          stock: parseInt(String(v.stock ?? 50)) || 50,
          attributes: typeof v.attributes === "string" ? v.attributes : JSON.stringify(v.attributes || { Size: v.size || v.title || "Free Size" }),
          imageUrl: v.imageUrl || null,
        })),
      },
    },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      variants: true,
      category: true,
    },
  });

  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/product/${product.slug}`);
    revalidatePath(`/product/${product.id}`);
    revalidatePath("/admin/products");
    revalidatePath("/admin/imports/meesho");
    revalidatePath("/");
  } catch (e) {}

  return { product, isUpdate: false };
}
