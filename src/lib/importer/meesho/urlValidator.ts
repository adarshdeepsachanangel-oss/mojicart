/**
 * Meesho Product URL Validator and Parser
 * Supports various formats of Meesho product URLs:
 * - https://www.meesho.com/wildplay-chocolate-30ml-perfume-spray-vanilla-fragrance/p/1op63p
 * - https://www.meesho.com/s/p/1op63p
 * - https://meesho.com/p/1op63p
 * - URLs with search params / tracking tags
 */

export interface ParsedMeeshoUrl {
  isValid: boolean;
  normalizedUrl: string;
  productId?: string;
  slug?: string;
  error?: string;
}

const MEESHO_DOMAINS = ["meesho.com", "www.meesho.com", "supply.meesho.com"];

export function validateAndParseMeeshoUrl(rawUrl: string): ParsedMeeshoUrl {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      isValid: false,
      normalizedUrl: "",
      error: "URL is empty or invalid",
    };
  }

  const trimmed = rawUrl.trim();

  let urlObj: URL;
  try {
    // Add protocol if missing
    const withProtocol = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
    urlObj = new URL(withProtocol);
  } catch {
    return {
      isValid: false,
      normalizedUrl: trimmed,
      error: "Malformed URL format",
    };
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

  // Patterns:
  // 1. /slug-name/p/{productId}
  // 2. /s/p/{productId}
  // 3. /p/{productId}
  const fullSlugPattern = /^\/([a-zA-Z0-9-_]+)\/p\/([a-zA-Z0-9]+)\/?$/;
  const shortPattern = /^\/(?:s\/)?p\/([a-zA-Z0-9]+)\/?$/;

  let productId: string | undefined;
  let slug: string | undefined;

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

  // Build clean normalized URL without tracking queries
  const cleanPath = slug && slug !== `meesho-product-${productId}`
    ? `/${slug}/p/${productId}`
    : `/s/p/${productId}`;
  const normalizedUrl = `https://www.meesho.com${cleanPath}`;

  return {
    isValid: true,
    normalizedUrl,
    productId,
    slug,
  };
}

export function validateBulkUrls(urls: string[]): {
  valid: ParsedMeeshoUrl[];
  invalid: { url: string; error: string }[];
  duplicates: string[];
} {
  const valid: ParsedMeeshoUrl[] = [];
  const invalid: { url: string; error: string }[] = [];
  const seenUrls = new Set<string>();
  const duplicates: string[] = [];

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
