import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { MeeshoScraperService } from "@/lib/importer/meesho/scraperService";
import { suggestCategory } from "@/lib/importer/meesho/categoryMapper";
import { detectDuplicate } from "@/lib/importer/meesho/duplicateDetector";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { url, html, rawProduct } = body;

    let normalizedProduct;
    let runId = "direct-extract";

    if (rawProduct && typeof rawProduct === "object") {
      const { normalizeMeeshoProduct } = await import("@/lib/importer/meesho/normalizer");
      normalizedProduct = normalizeMeeshoProduct(rawProduct, url || rawProduct.url);
    } else if (html && typeof html === "string") {
      const { extractFromMeeshoHtml } = await import("@/lib/importer/meesho/htmlParser");
      normalizedProduct = extractFromMeeshoHtml(html, url);
    } else {
      if (!url || typeof url !== "string") {
        return NextResponse.json(
          { error: "Missing or invalid 'url' parameter" },
          { status: 400 }
        );
      }

      console.log("[PREVIEW REQUEST] Incoming URL:", url);
      const scraper = new MeeshoScraperService();
      const result = await scraper.scrapeSingleProduct(url);
      normalizedProduct = result.normalized;
      runId = result.runId;
    }

    // Suggest closest category
    const suggestedCategory = await suggestCategory(
      normalizedProduct.categoryHint,
      normalizedProduct.title
    );

    // Duplicate check
    const duplicate = await detectDuplicate(
      normalizedProduct.sourceUrl,
      normalizedProduct.sourceProductId
    );

    return NextResponse.json({
      success: true,
      product: normalizedProduct,
      suggestedCategory,
      duplicate,
      runId,
    });
  } catch (error: any) {
    console.error("Meesho preview error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to preview Meesho product" },
      { status: 500 }
    );
  }
}
