import prisma from "@/lib/prisma";
import { validateAndParseMeeshoUrl } from "./urlValidator";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedBy?: "sourceUrl" | "sourceProductId" | "sku";
  existingProduct?: {
    id: string;
    title: string;
    slug: string;
    sku: string;
    basePrice: number;
    mrp: number;
    status: string;
    sourceUrl?: string | null;
    sourceProductId?: string | null;
    category?: { id: string; name: string };
    images?: { url: string }[];
  } | null;
}

export async function detectDuplicate(
  sourceUrl: string,
  sourceProductId?: string,
  sku?: string
): Promise<DuplicateCheckResult> {
  const parsed = validateAndParseMeeshoUrl(sourceUrl);
  const normalizedUrl = parsed.isValid ? parsed.normalizedUrl : sourceUrl.trim();
  const prodId = sourceProductId || parsed.productId;
  const targetSku = sku || (prodId ? `MEE-${prodId}` : undefined);

  // 1. Check by source URL
  if (normalizedUrl) {
    const byUrl = await prisma.product.findFirst({
      where: {
        OR: [
          { sourceUrl: normalizedUrl },
          { sourceUrl: sourceUrl.trim() },
        ],
      },
      include: {
        category: { select: { id: true, name: true } },
        images: { take: 1 },
      },
    });

    if (byUrl) {
      return {
        isDuplicate: true,
        matchedBy: "sourceUrl",
        existingProduct: byUrl,
      };
    }
  }

  // 2. Check by source product ID
  if (prodId) {
    const bySourceId = await prisma.product.findFirst({
      where: {
        sourceProductId: prodId,
      },
      include: {
        category: { select: { id: true, name: true } },
        images: { take: 1 },
      },
    });

    if (bySourceId) {
      return {
        isDuplicate: true,
        matchedBy: "sourceProductId",
        existingProduct: bySourceId,
      };
    }
  }

  // 3. Check by SKU
  if (targetSku) {
    const bySku = await prisma.product.findUnique({
      where: { sku: targetSku },
      include: {
        category: { select: { id: true, name: true } },
        images: { take: 1 },
      },
    });

    if (bySku) {
      return {
        isDuplicate: true,
        matchedBy: "sku",
        existingProduct: bySku,
      };
    }
  }

  return {
    isDuplicate: false,
  };
}
