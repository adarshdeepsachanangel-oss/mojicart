import fs from "fs";
import path from "path";
import crypto from "crypto";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const DOWNLOAD_TIMEOUT_MS = 15000; // 15 seconds

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

/**
 * SSRF Prevention check: ensures hostname does not resolve to local / private loopback or metadata IPs
 */
function isDisallowedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower === "169.254.169.254" || // AWS / cloud metadata
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }

  // IPv4 private ranges
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octet1 = parseInt(ipv4Match[1], 10);
    const octet2 = parseInt(ipv4Match[2], 10);
    if (octet1 === 10) return true; // 10.0.0.0/8
    if (octet1 === 127) return true; // 127.0.0.0/8
    if (octet1 === 192 && octet2 === 168) return true; // 192.168.0.0/16
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true; // 172.16.0.0/12
    if (octet1 === 169 && octet2 === 254) return true; // Link-local
  }

  return false;
}

/**
 * Validates magic bytes for common image types
 */
function validateImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }
  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }
  // GIF: 47 49 46 38
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return true;
  }
  // WebP: RIFF ... WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return true;
  }
  // AVIF / ISO BMFF (ftyp)
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    return true;
  }

  return false;
}

export interface ImageDownloadResult {
  originalUrl: string;
  storedUrl: string;
  success: boolean;
  fileSizeBytes?: number;
  mimeType?: string;
  error?: string;
}

/**
 * Downloads an image safely from a remote URL, validates it, and writes it to public/uploads/products/
 */
export async function downloadAndStoreImage(
  url: string,
  prefix = "p"
): Promise<ImageDownloadResult> {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        originalUrl: url,
        storedUrl: url,
        success: false,
        error: `Disallowed protocol ${parsed.protocol}. Only http/https supported.`,
      };
    }

    if (isDisallowedHost(parsed.hostname)) {
      return {
        originalUrl: url,
        storedUrl: url,
        success: false,
        error: `Security error: disallowed host ${parsed.hostname}.`,
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Mojicart/1.0",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        originalUrl: url,
        storedUrl: url,
        success: false,
        error: `HTTP error ${response.status} ${response.statusText}`,
      };
    }

    const contentType = (response.headers.get("content-type") || "")
      .toLowerCase()
      .split(";")[0]
      .trim();

    const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_IMAGE_SIZE) {
      return {
        originalUrl: url,
        storedUrl: url,
        success: false,
        error: `File size exceeds 10MB limit (${contentLength} bytes)`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_IMAGE_SIZE) {
      return {
        originalUrl: url,
        storedUrl: url,
        success: false,
        error: `Downloaded buffer exceeds 10MB limit (${buffer.length} bytes)`,
      };
    }

    if (!validateImageMagicBytes(buffer)) {
      return {
        originalUrl: url,
        storedUrl: url,
        success: false,
        error: "Invalid image content: failed magic byte verification.",
      };
    }

    const ext = ALLOWED_MIME_TYPES[contentType] || ".jpg";
    const hash = crypto.createHash("md5").update(buffer).digest("hex").slice(0, 10);
    const filename = `${prefix}_${Date.now()}_${hash}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const storedUrl = `/uploads/products/${filename}`;

    return {
      originalUrl: url,
      storedUrl,
      success: true,
      fileSizeBytes: buffer.length,
      mimeType: contentType,
    };
  } catch (err: any) {
    return {
      originalUrl: url,
      storedUrl: url,
      success: false,
      error: err?.message || "Failed to download image",
    };
  }
}

/**
 * Processes multiple image URLs in parallel with concurrency limit
 */
export async function downloadImageGallery(
  urls: string[],
  prefix = "p",
  concurrency = 3
): Promise<ImageDownloadResult[]> {
  const results: ImageDownloadResult[] = [];
  const queue = [...urls];

  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      if (url) {
        const res = await downloadAndStoreImage(url, prefix);
        results.push(res);
      }
    }
  });

  await Promise.all(workers);
  return results;
}
