/**
 * Normalization layer for Apify actor: ecomscrape/meesho-product-details-page-scraper
 * Maps varying actor output fields (snake_case and camelCase) into Mojicart's canonical schema.
 */

export interface NormalizedVariant {
  sku?: string;
  title: string;
  size?: string;
  color?: string;
  price: number;
  mrp: number;
  stock: number;
  imageUrl?: string;
  attributes: Record<string, any>;
}

export interface NormalizedMeeshoProduct {
  sourceProductId: string;
  sourceUrl: string;
  slug: string;
  title: string;
  brand: string;
  description: string;
  highlights: string[];
  specs: Record<string, string>;
  categoryHint: {
    id?: string | number;
    name?: string;
    subCategory?: string;
    hierarchy?: string[];
  };
  pricing: {
    sourcePrice: number;
    sourceMrp: number;
    discountPercent: number;
    currency: string;
    shippingCharges: number;
  };
  images: string[];
  variants: NormalizedVariant[];
  ratings: {
    score: number;
    ratingCount: number;
    reviewCount: number;
    breakdown?: Record<string, number>;
  };
  isAssured: boolean;
  rawSourceData: any;
  retrievedAt: string;
}

/**
 * Clean HTML or markdown tags and whitespace
 */
export function cleanText(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  return str.replace(/<[^>]*>/g, "").trim();
}

/**
 * Safely parse numbers from string or numbers (e.g. "₹299", "299.00", 299)
 */
function parseNumber(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
}

/**
 * Extracts all valid image URLs from various field formats
 */
function extractImageUrls(rawImages: any): string[] {
  if (!rawImages) return [];
  const list: string[] = [];

  const addUrl = (url: any) => {
    if (typeof url === "string" && url.trim().startsWith("http")) {
      list.push(url.trim());
    } else if (url && typeof url === "object" && typeof url.url === "string") {
      list.push(url.url.trim());
    }
  };

  if (Array.isArray(rawImages)) {
    for (const item of rawImages) {
      if (typeof item === "string") {
        addUrl(item);
      } else if (item && typeof item === "object") {
        if (item.url) addUrl(item.url);
        else if (item.image) addUrl(item.image);
        else if (item.src) addUrl(item.src);
      }
    }
  } else if (typeof rawImages === "string") {
    addUrl(rawImages);
  }

  // Deduplicate URLs while preserving order
  return Array.from(new Set(list));
}

/**
 * Normalizes an Apify actor dataset record into Mojicart's standard product structure
 */
export function normalizeMeeshoProduct(
  raw: any,
  fallbackUrl?: string
): NormalizedMeeshoProduct {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid raw product data: expected object");
  }

  // 1. Core Identifiers
  const sourceProductId = String(
    raw.product_id ||
      raw.productId ||
      raw.id ||
      raw.catalog_id ||
      raw.catalogId ||
      (fallbackUrl ? fallbackUrl.split("/p/").pop()?.split("?")[0] : "") ||
      Date.now().toString()
  ).trim();

  const sourceUrl =
    raw.url ||
    raw.product_url ||
    raw.productUrl ||
    fallbackUrl ||
    `https://www.meesho.com/s/p/${sourceProductId}`;

  const title =
    cleanText(raw.title) ||
    cleanText(raw.name) ||
    cleanText(raw.product_name) ||
    cleanText(raw.productName) ||
    `Meesho Product ${sourceProductId}`;

  let slug =
    cleanText(raw.slug) ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  if (!slug) slug = `meesho-${sourceProductId}`;

  const brand =
    cleanText(raw.brand) ||
    cleanText(raw.brand_name) ||
    cleanText(raw.supplier_name) ||
    cleanText(raw.seller_name) ||
    "Meesho Supplier";

  // 2. Descriptions & Highlights
  const description =
    cleanText(raw.description) ||
    cleanText(raw.product_details) ||
    cleanText(raw.details) ||
    cleanText(raw.short_description) ||
    title;

  let highlights: string[] = [];
  if (Array.isArray(raw.highlights)) {
    highlights = raw.highlights.map(cleanText).filter(Boolean);
  } else if (Array.isArray(raw.features)) {
    highlights = raw.features.map(cleanText).filter(Boolean);
  } else if (typeof raw.highlights === "string") {
    highlights = raw.highlights
      .split(/\r?\n|•|-|\*/)
      .map(cleanText)
      .filter((s: string) => s.length > 2);
  }

  // 3. Specifications & Attributes
  const specs: Record<string, string> = {};
  const rawSpecs =
    raw.specifications ||
    raw.specs ||
    raw.attributes ||
    raw.details_dict ||
    raw.product_attributes;

  if (rawSpecs && typeof rawSpecs === "object" && !Array.isArray(rawSpecs)) {
    for (const [k, v] of Object.entries(rawSpecs)) {
      if (v !== null && v !== undefined && String(v).trim()) {
        specs[cleanText(k)] = cleanText(v);
      }
    }
  } else if (Array.isArray(rawSpecs)) {
    for (const item of rawSpecs) {
      if (item && typeof item === "object") {
        const key = cleanText(item.name || item.key || item.title);
        const val = cleanText(item.value || item.val || item.description);
        if (key && val) specs[key] = val;
      }
    }
  }

  // Also pull common fields into specs if present
  if (raw.fabric && !specs["Fabric"]) specs["Fabric"] = cleanText(raw.fabric);
  if (raw.material && !specs["Material"]) specs["Material"] = cleanText(raw.material);
  if (raw.color && !specs["Color"]) specs["Color"] = cleanText(raw.color);
  if (raw.pattern && !specs["Pattern"]) specs["Pattern"] = cleanText(raw.pattern);
  if (raw.fit && !specs["Fit"]) specs["Fit"] = cleanText(raw.fit);
  if (raw.country_of_origin && !specs["Country of Origin"]) {
    specs["Country of Origin"] = cleanText(raw.country_of_origin);
  }

  // 4. Category Hierarchy
  const categoryHierarchy: string[] = [];
  if (Array.isArray(raw.category_hierarchy)) {
    categoryHierarchy.push(...raw.category_hierarchy.map(cleanText).filter(Boolean));
  } else if (typeof raw.category_hierarchy === "string") {
    categoryHierarchy.push(...raw.category_hierarchy.split(">").map(cleanText).filter(Boolean));
  }

  const categoryHint = {
    id: raw.category_id || raw.categoryId,
    name: cleanText(raw.category_name || raw.category || raw.primary_category),
    subCategory: cleanText(
      raw.subcategory ||
        raw.sub_category ||
        raw.sub_sub_category_name ||
        raw.subCategory
    ),
    hierarchy: categoryHierarchy,
  };

  // 5. Pricing
  const sourcePrice = parseNumber(
    raw.price ??
      raw.final_price ??
      raw.finalPrice ??
      raw.selling_price ??
      raw.sellingPrice ??
      raw.special_price ??
      raw.specialPrice
  );
  let sourceMrp = parseNumber(
    raw.mrp ??
      raw.original_price ??
      raw.originalPrice ??
      raw.retail_price ??
      raw.retailPrice ??
      raw.regular_price ??
      raw.regularPrice
  );
  if (sourceMrp <= 0 || sourceMrp < sourcePrice) {
    // If MRP wasn't scraped or is smaller than price, calculate realistic baseline
    sourceMrp = sourcePrice > 0 ? Math.round(sourcePrice * 1.3) : 0;
  }

  let discountPercent = parseNumber(raw.discount ?? raw.discount_percentage);
  if (discountPercent <= 0 && sourceMrp > sourcePrice && sourceMrp > 0) {
    discountPercent = Math.round(((sourceMrp - sourcePrice) / sourceMrp) * 100);
  }

  const shippingCharges = parseNumber(raw.shipping_charges ?? raw.shippingFee ?? 0);

  // 6. Media / Images
  const rawImages = raw.images || raw.image_urls || raw.images_list || raw.product_images;
  const images = extractImageUrls(rawImages);
  if (images.length === 0 && raw.image) {
    images.push(...extractImageUrls(raw.image));
  }

  // 7. Ratings & Reviews
  const score = parseNumber(
    raw.rating ?? raw.rating_score ?? raw.ratingScore ?? raw.avg_rating ?? 0
  );
  const ratingCount = Math.round(
    parseNumber(
      raw.rating_count ??
        raw.ratingCount ??
        raw.number_of_ratings ??
        raw.total_ratings ??
        0
    )
  );
  const reviewCount = Math.round(
    parseNumber(
      raw.review_count ??
        raw.reviews_count ??
        raw.reviewCount ??
        raw.total_reviews ??
        0
    )
  );

  // 8. Variants
  const variants: NormalizedVariant[] = [];
  let rawVariants = raw.variants || raw.product_variants || raw.sizes;

  if ((!rawVariants || rawVariants.length === 0) && Array.isArray(raw.suppliers)) {
    for (const sup of raw.suppliers) {
      if (Array.isArray(sup.inventory) && sup.inventory.length > 0) {
        rawVariants = sup.inventory.map((item: any) => ({
          title: item?.variation?.name || item?.variation?.size || "Free Size",
          size: item?.variation?.name || item?.variation?.size || "Free Size",
          price: item?.variation?.final_price || item?.variation?.discounted_price || item?.variation?.price || sourcePrice,
          mrp: item?.variation?.original_price || item?.variation?.mrp || sourceMrp,
          stock: item?.in_stock === false ? 0 : 50,
        }));
        break;
      }
    }
  }

  if ((!rawVariants || rawVariants.length === 0) && Array.isArray(raw.variations)) {
    rawVariants = raw.variations;
  }

  if (Array.isArray(rawVariants)) {
    for (let i = 0; i < rawVariants.length; i++) {
      const v = rawVariants[i];
      if (!v) continue;
      if (typeof v === "string") {
        // Simple size string e.g. "M", "L", "XL"
        variants.push({
          sku: `MEE-${sourceProductId}-V${i + 1}`,
          title: `Size: ${v.trim()}`,
          size: v.trim(),
          price: sourcePrice,
          mrp: sourceMrp,
          stock: 25,
          attributes: { Size: v.trim() },
        });
      } else if (typeof v === "object") {
        const varTitle =
          cleanText(v.title) ||
          cleanText(v.name) ||
          (v.size ? `Size: ${cleanText(v.size)}` : `Variant ${i + 1}`);
        const varPrice = parseNumber(v.price, sourcePrice);
        let varMrp = parseNumber(v.mrp, sourceMrp);
        if (varMrp <= varPrice && sourceMrp > sourcePrice) {
          varMrp = varPrice === sourcePrice ? sourceMrp : Math.round(varPrice * (sourceMrp / (sourcePrice || 1)));
        } else if (varMrp <= varPrice) {
          varMrp = Math.round((varPrice || sourcePrice) * 1.5);
        }
        const varStock = parseNumber(v.stock ?? v.inventory, 25);
        const varImg = typeof v.image === "string" ? v.image : undefined;

        variants.push({
          sku: cleanText(v.sku) || `MEE-${sourceProductId}-V${i + 1}`,
          title: varTitle,
          size: cleanText(v.size),
          color: cleanText(v.color),
          price: varPrice > 0 ? varPrice : sourcePrice,
          mrp: varMrp,
          stock: varStock,
          imageUrl: varImg,
          attributes: typeof v.attributes === "object" ? v.attributes : { Title: varTitle },
        });
      }
    }
  }

  // 9. Assured details
  const isAssured = Boolean(
    raw.assured_details ||
      raw.assuredDetails ||
      raw.meesho_assured ||
      raw.is_assured
  );

  return {
    sourceProductId,
    sourceUrl,
    slug,
    title,
    brand,
    description,
    highlights,
    specs,
    categoryHint,
    pricing: {
      sourcePrice,
      sourceMrp,
      discountPercent,
      currency: "INR",
      shippingCharges,
    },
    images,
    variants,
    ratings: {
      score: Math.min(5, Math.max(0, score)),
      ratingCount,
      reviewCount,
    },
    isAssured,
    rawSourceData: raw,
    retrievedAt: new Date().toISOString(),
  };
}
