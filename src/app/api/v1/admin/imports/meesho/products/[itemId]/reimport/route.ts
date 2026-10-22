import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { MeeshoScraperService } from "@/lib/importer/meesho/scraperService";
import { saveImportedMeeshoProduct } from "@/lib/importer/meesho/productSaver";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { itemId } = await params;
    const item = await prisma.importItem.findUnique({ where: { id: itemId } });

    if (!item) {
      return NextResponse.json({ error: "Import item not found" }, { status: 404 });
    }

    const scraper = new MeeshoScraperService();
    const scraped = await scraper.scrapeSingleProduct(item.sourceUrl);

    // Save with allowUpdateDuplicate: true
    const { product: updatedProduct } = await saveImportedMeeshoProduct(
      scraped.normalized,
      {
        jobId: item.jobId,
        allowUpdateDuplicate: true,
      }
    );

    await prisma.importItem.update({
      where: { id: itemId },
      data: {
        status: updatedProduct.status === "APPROVED" ? "PUBLISHED" : "IMPORTED_DRAFT",
        title: updatedProduct.title,
        sourcePrice: scraped.normalized.pricing.sourcePrice,
        sourceMrp: scraped.normalized.pricing.sourceMrp,
        extractedData: JSON.stringify(scraped.normalized),
        productId: updatedProduct.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product re-imported and refreshed successfully",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("Reimport product error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to re-import product" },
      { status: 500 }
    );
  }
}
