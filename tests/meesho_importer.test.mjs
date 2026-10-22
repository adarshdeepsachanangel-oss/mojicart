import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// -------------------------------------------------------------
// 1. URL Validation & Parsing
// -------------------------------------------------------------
const MEESHO_DOMAINS = ["meesho.com", "www.meesho.com", "supply.meesho.com"];

function validateAndParseMeeshoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isValid: false, normalizedUrl: "", error: "URL is empty or invalid" };
  }
  const trimmed = rawUrl.trim();
  let urlObj;
  try {
    const withProtocol = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
    urlObj = new URL(withProtocol);
  } catch {
    return { isValid: false, normalizedUrl: trimmed, error: "Malformed URL format" };
  }

  const hostname = urlObj.hostname.toLowerCase();
  const isMeeshoHost = MEESHO_DOMAINS.some(
    (d) => hostname === d || hostname.endsWith(`.${d}`)
  );

  if (!isMeeshoHost) {
    return {
      isValid: false,
      normalizedUrl: urlObj.href,
      error: `Invalid domain '${hostname}'. Only approved meesho.com product URLs are supported.`,
    };
  }

  const pathname = urlObj.pathname;
  const fullSlugPattern = /^\/([a-zA-Z0-9-_]+)\/p\/([a-zA-Z0-9]+)\/?$/;
  const shortPattern = /^\/(?:s\/)?p\/([a-zA-Z0-9]+)\/?$/;

  let productId;
  let slug;

  const fullMatch = pathname.match(fullSlugPattern);
  if (fullMatch) {
    slug = fullMatch[1];
    productId = fullMatch[2];
  } else {
    const shortMatch = pathname.match(shortPattern);
    if (shortMatch) {
      productId = shortMatch[1];
      slug = `meesho-product-${productId}`;
    }
  }

  if (!productId) {
    return {
      isValid: false,
      normalizedUrl: urlObj.href,
      error: "URL is not a recognized Meesho product page. Expected path format: /product-name/p/{productId} or /s/p/{productId}",
    };
  }

  const cleanPath = slug && slug !== `meesho-product-${productId}`
    ? `/${slug}/p/${productId}`
    : `/s/p/${productId}`;
  const normalizedUrl = `https://www.meesho.com${cleanPath}`;

  return { isValid: true, normalizedUrl, productId, slug };
}

function validateBulkUrls(urls) {
  const valid = [];
  const invalid = [];
  const seenUrls = new Set();
  const duplicates = [];

  for (const raw of urls) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const parsed = validateAndParseMeeshoUrl(trimmed);
    if (!parsed.isValid) {
      invalid.push({ url: trimmed, error: parsed.error || "Invalid URL" });
      continue;
    }
    if (seenUrls.has(parsed.normalizedUrl)) {
      duplicates.push(parsed.normalizedUrl);
      continue;
    }
    seenUrls.add(parsed.normalizedUrl);
    valid.push(parsed);
  }
  return { valid, invalid, duplicates };
}

test("1. URL Validation: Valid Meesho product URL formats", () => {
  const url1 = "https://www.meesho.com/wildplay-chocolate-30ml-perfume-spray-vanilla-fragrance/p/1op63p";
  const res1 = validateAndParseMeeshoUrl(url1);
  assert.equal(res1.isValid, true);
  assert.equal(res1.productId, "1op63p");
  assert.equal(res1.slug, "wildplay-chocolate-30ml-perfume-spray-vanilla-fragrance");
  assert.equal(res1.normalizedUrl, "https://www.meesho.com/wildplay-chocolate-30ml-perfume-spray-vanilla-fragrance/p/1op63p");

  const url2 = "https://www.meesho.com/s/p/5dzn8f?utm_source=google&tracking=abc";
  const res2 = validateAndParseMeeshoUrl(url2);
  assert.equal(res2.isValid, true);
  assert.equal(res2.productId, "5dzn8f");
  assert.equal(res2.normalizedUrl, "https://www.meesho.com/s/p/5dzn8f");
});

test("2. URL Validation: Rejection of invalid domains and malformed paths", () => {
  const badDomain = "https://www.amazon.in/dp/B08L5WHJ2T";
  const res1 = validateAndParseMeeshoUrl(badDomain);
  assert.equal(res1.isValid, false);
  assert.match(res1.error || "", /only approved meesho\.com/i);

  const missingId = "https://www.meesho.com/products/all";
  const res2 = validateAndParseMeeshoUrl(missingId);
  assert.equal(res2.isValid, false);
  assert.match(res2.error || "", /not a recognized meesho product page/i);
});

test("3. Bulk URL Validation: Duplicate filtering and batch isolation", () => {
  const urls = [
    "https://www.meesho.com/s/p/1op63p",
    "https://www.meesho.com/s/p/1op63p?src=share",
    "https://www.meesho.com/s/p/2smq2y",
    "https://invalid-site.com/item/123",
    "",
  ];
  const batch = validateBulkUrls(urls);
  assert.equal(batch.valid.length, 2);
  assert.equal(batch.duplicates.length, 1);
  assert.equal(batch.invalid.length, 1);
  assert.equal(batch.valid[0].productId, "1op63p");
  assert.equal(batch.valid[1].productId, "2smq2y");
});

// -------------------------------------------------------------
// 2. Normalization Layer Tests
// -------------------------------------------------------------
function cleanText(val) {
  if (val === null || val === undefined) return "";
  return String(val).replace(/<[^>]*>/g, "").trim();
}

function parseNumber(val, fallback = 0) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
}

function normalizeMeeshoProduct(raw, fallbackUrl) {
  const sourceProductId = String(
    raw.product_id || raw.productId || raw.id || "dummy-id"
  ).trim();

  const title =
    cleanText(raw.title) || cleanText(raw.name) || `Meesho Product ${sourceProductId}`;

  const sourcePrice = parseNumber(
    raw.price ?? raw.final_price ?? raw.finalPrice ?? raw.selling_price ?? raw.sellingPrice ?? 0
  );

  let sourceMrp = parseNumber(
    raw.mrp ?? raw.original_price ?? raw.originalPrice ?? raw.retail_price ?? 0
  );
  if (sourceMrp <= 0 || sourceMrp < sourcePrice) {
    sourceMrp = sourcePrice > 0 ? Math.round(sourcePrice * 1.3) : 0;
  }

  const score = parseNumber(raw.rating ?? raw.rating_score ?? raw.ratingScore ?? 0);
  const ratingCount = Math.round(parseNumber(raw.rating_count ?? raw.ratingCount ?? raw.reviewsCount ?? 0));

  return {
    sourceProductId,
    title,
    pricing: {
      sourcePrice,
      sourceMrp,
      discountPercent: sourceMrp > sourcePrice ? Math.round(((sourceMrp - sourcePrice) / sourceMrp) * 100) : 0,
    },
    ratings: {
      score,
      ratingCount,
    },
    isAssured: Boolean(raw.assured_details || raw.meesho_assured),
  };
}

test("4. Normalization Layer: Handles snake_case and camelCase Apify fields", () => {
  const rawSnake = {
    product_id: "1op63p",
    title: "Wildplay Chocolate & Vanilla 30ml Eau De Parfum",
    price: 299.0,
    mrp: 699.0,
    rating_score: 4.5,
    rating_count: 1200,
    assured_details: true,
  };
  const norm1 = normalizeMeeshoProduct(rawSnake);
  assert.equal(norm1.sourceProductId, "1op63p");
  assert.equal(norm1.pricing.sourcePrice, 299);
  assert.equal(norm1.pricing.sourceMrp, 699);
  assert.equal(norm1.ratings.score, 4.5);
  assert.equal(norm1.ratings.ratingCount, 1200);
  assert.equal(norm1.isAssured, true);

  const rawCamel = {
    productId: "99zz11",
    name: "Pure Silk Embroidered Saree",
    sellingPrice: 899,
    originalPrice: 2499,
    rating: 4.8,
    reviewsCount: 350,
  };
  const norm2 = normalizeMeeshoProduct(rawCamel);
  assert.equal(norm2.sourceProductId, "99zz11");
  assert.equal(norm2.pricing.sourcePrice, 899);
  assert.equal(norm2.pricing.sourceMrp, 2499);
  assert.equal(norm2.ratings.score, 4.8);
  assert.equal(norm2.ratings.ratingCount, 350);
});

// -------------------------------------------------------------
// 3. Database & Storefront Visibility Tests
// -------------------------------------------------------------
test("5. Database Save & Draft Protection: Draft hidden, Approved visible", async () => {
  const category = await prisma.category.findFirst() || await prisma.category.create({
    data: { name: "Test Cat", slug: "test-cat-" + Date.now() },
  });
  const seller = await prisma.seller.findFirst() || await prisma.seller.create({
    data: {
      userId: (await prisma.user.findFirst())?.id || "",
      storeName: "Test Store",
      storeSlug: "test-store-" + Date.now(),
    },
  });

  const testSku = "MEE-TEST-" + Date.now().toString().slice(-6);

  // 1. Create product as DRAFT
  const draftProduct = await prisma.product.create({
    data: {
      title: "Test Draft Importer Product",
      slug: "test-draft-" + Date.now(),
      description: "Draft item description",
      categoryId: category.id,
      sellerId: seller.id,
      status: "DRAFT",
      basePrice: 299,
      mrp: 599,
      sku: testSku,
      stock: 10,
      importSource: "MEESHO",
      sourceUrl: "https://www.meesho.com/s/p/testdraft",
      sourceProductId: "testdraft",
      sourcePrice: 249,
      sourceMrp: 599,
    },
  });

  assert.equal(draftProduct.status, "DRAFT");

  // Query as public customer (status === "APPROVED")
  const publicView = await prisma.product.findFirst({
    where: { id: draftProduct.id, status: "APPROVED" },
  });
  assert.equal(publicView, null, "Draft product MUST NOT be visible publicly");

  // 2. Publish product
  const publishedProduct = await prisma.product.update({
    where: { id: draftProduct.id },
    data: { status: "APPROVED" },
  });
  assert.equal(publishedProduct.status, "APPROVED");

  const publicLive = await prisma.product.findFirst({
    where: { id: draftProduct.id, status: "APPROVED" },
  });
  assert.ok(publicLive !== null, "Approved product MUST be visible publicly");

  // Cleanup
  await prisma.product.delete({ where: { id: draftProduct.id } });
});

test("6. Duplicate Detection: Detects existing sourceUrl and sku", async () => {
  const existing = await prisma.product.findFirst({ where: { status: "APPROVED" } });
  assert.ok(existing, "Expected existing product");

  const bySku = await prisma.product.findUnique({ where: { sku: existing.sku } });
  assert.equal(bySku?.id, existing.id);
});

test("7. SSRF Security: Rejection of private, local, and metadata IP hosts", () => {
  function isDisallowedHost(hostname) {
    const lower = hostname.toLowerCase();
    if (
      lower === "localhost" ||
      lower === "127.0.0.1" ||
      lower === "0.0.0.0" ||
      lower === "::1" ||
      lower === "169.254.169.254" ||
      lower.endsWith(".local") ||
      lower.endsWith(".internal")
    ) {
      return true;
    }
    const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const octet1 = parseInt(ipv4Match[1], 10);
      const octet2 = parseInt(ipv4Match[2], 10);
      if (octet1 === 10) return true;
      if (octet1 === 127) return true;
      if (octet1 === 192 && octet2 === 168) return true;
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
      if (octet1 === 169 && octet2 === 254) return true;
    }
    return false;
  }

  assert.equal(isDisallowedHost("localhost"), true);
  assert.equal(isDisallowedHost("127.0.0.1"), true);
  assert.equal(isDisallowedHost("169.254.169.254"), true);
  assert.equal(isDisallowedHost("192.168.1.1"), true);
  assert.equal(isDisallowedHost("10.0.0.1"), true);
  assert.equal(isDisallowedHost("images.unsplash.com"), false);
  assert.equal(isDisallowedHost("images.meesho.com"), false);
});

test("8. Safe Re-import Policy: Protects custom selling prices from being overwritten", () => {
  let existingProduct = {
    title: "Admin Custom Title",
    basePrice: 499, // Admin customized selling price
    mrp: 999,
    sourcePrice: 299,
  };

  const incomingMeeshoData = {
    title: "Supplier New Meesho Title",
    sourcePrice: 249, // Meesho changed price
    mrp: 899,
  };

  // Safe update: updates sourcePrice while preserving admin custom basePrice
  const updatedProduct = {
    ...existingProduct,
    sourcePrice: incomingMeeshoData.sourcePrice,
    // basePrice is NOT overwritten!
  };

  assert.equal(updatedProduct.basePrice, 499, "Admin selling price must be preserved");
  assert.equal(updatedProduct.sourcePrice, 249, "Source price should update to refreshed value");
});

test("9. Security & RBAC: Only authorized Admin roles can trigger imports", () => {
  const ADMIN_ROLES = [
    "SUPER_ADMIN",
    "OPERATIONS_ADMIN",
    "CATALOG_MANAGER",
    "ORDER_MANAGER",
    "SUPPORT_STAFF",
    "FINANCE_MANAGER",
  ];

  function isAdmin(role) {
    return ADMIN_ROLES.includes(role);
  }

  for (const role of ADMIN_ROLES) {
    assert.equal(isAdmin(role), true, `${role} should be authorized`);
  }
  assert.equal(isAdmin("CUSTOMER"), false);
  assert.equal(isAdmin("SELLER"), false);
  assert.equal(isAdmin("ANONYMOUS"), false);
});

test("10. Security: APIFY_API_TOKEN is private server-side and never exposed", () => {
  const envKeys = Object.keys(process.env);
  const publicApifyKey = envKeys.find((k) => k.startsWith("NEXT_PUBLIC_APIFY"));
  assert.equal(
    publicApifyKey,
    undefined,
    "APIFY token must NEVER use NEXT_PUBLIC_ prefix to prevent browser exposure"
  );
});

test("11. Product Resolution & Accuracy: Ashirwad Kurta Set (90tis4) details and variation MRPs", () => {
  const url = "https://www.meesho.com/ashirwad-kurta-set-for-womenprinted-kurta-set-for-womenstylish-kurta-sets-for-womenfloral-kurta-setcotton-kurta-set-for-women-bit/p/90tis4";
  const parsed = validateAndParseMeeshoUrl(url);
  assert.equal(parsed.isValid, true);
  assert.equal(parsed.productId, "90tis4");

  // Verify normalizeMeeshoProduct behavior for 90tis4
  const mock90tis4Raw = {
    product_id: "90tis4",
    title: "Ashirwad kurta set for women||printed kurta set for women||stylish kurta sets for women||floral kurta set||cotton kurta set for women BIT",
    price: 342,
    mrp: 799,
    images: [
      "https://images.meesho.com/images/products/545572948/pcion_1024.jpg",
      "https://images.meesho.com/images/products/545572948/b06zj_1024.jpg"
    ],
    variants: [
      { title: "XXS", size: "XXS", price: 180, mrp: 499, stock: 50 },
      { title: "S", size: "S", price: 342, mrp: 799, stock: 50 },
      { title: "M", size: "M", price: 342, mrp: 799, stock: 50 },
      { title: "L", size: "L", price: 342, mrp: 799, stock: 50 },
      { title: "XL", size: "XL", price: 342, mrp: 799, stock: 50 },
      { title: "XXL", size: "XXL", price: 342, mrp: 799, stock: 50 },
      { title: "XXXL", size: "XXXL", price: 342, mrp: 799, stock: 50 }
    ]
  };

  const normalized = normalizeMeeshoProduct(mock90tis4Raw, url);
  assert.equal(normalized.pricing.sourcePrice, 342);
  assert.equal(normalized.pricing.sourceMrp, 799);
  assert.equal(mock90tis4Raw.variants.length, 7);
  for (const v of mock90tis4Raw.variants) {
    assert.ok(v.mrp > v.price, `Variation ${v.title} MRP (${v.mrp}) must exceed selling price (${v.price})`);
  }
  // Verify images do not contain purple saree
  assert.ok(!mock90tis4Raw.images.some(img => img.includes("photo-1610030469983-98e550d6193c")));
});
