import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { MeeshoScraperService } from "@/lib/importer/meesho/scraperService";
import { suggestCategory } from "@/lib/importer/meesho/categoryMapper";
import { saveImportedMeeshoProduct } from "@/lib/importer/meesho/productSaver";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const job = await prisma.importJob.findUnique({
      where: { id },
      include: {
        items: {
          where: { status: { in: ["FAILED", "CANCELLED"] } },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Import job not found" }, { status: 404 });
    }

    if (job.items.length === 0) {
      return NextResponse.json(
        { error: "No failed or cancelled items to retry in this job." },
        { status: 400 }
      );
    }

    // Reset status to QUEUED
    await prisma.importItem.updateMany({
      where: {
        jobId: id,
        status: { in: ["FAILED", "CANCELLED"] },
      },
      data: {
        status: "QUEUED",
        errorDetails: null,
      },
    });

    await prisma.importJob.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    // Run retry in background
    (async () => {
      const scraper = new MeeshoScraperService();
      let successCount = job.successCount;
      let failedCount = 0;

      for (const item of job.items) {
        try {
          await prisma.importItem.update({
            where: { id: item.id },
            data: { status: "FETCHING" },
          });

          const scraped = await scraper.scrapeSingleProduct(item.sourceUrl);

          const suggested = await suggestCategory(
            scraped.normalized.categoryHint,
            scraped.normalized.title
          );

          const { product: savedProduct } = await saveImportedMeeshoProduct(
            scraped.normalized,
            {
              status: "DRAFT",
              categoryId: suggested?.categoryId,
              jobId: job.id,
            }
          );

          await prisma.importItem.update({
            where: { id: item.id },
            data: {
              status: "IMPORTED_DRAFT",
              title: savedProduct.title,
              productId: savedProduct.id,
              imagesDownloaded: savedProduct.images?.length || 0,
            },
          });

          successCount++;
        } catch (retryErr: any) {
          failedCount++;
          await prisma.importItem.update({
            where: { id: item.id },
            data: {
              status: "FAILED",
              errorDetails: retryErr?.message || "Retry attempt failed",
            },
          });
        }
      }

      await prisma.importJob.update({
        where: { id },
        data: {
          status: failedCount > 0 ? "PARTIAL" : "COMPLETED",
          successCount,
          failedCount,
        },
      });
    })().catch((err) => console.error("Retry background error:", err));

    return NextResponse.json({
      success: true,
      message: `Retrying ${job.items.length} items.`,
    });
  } catch (error: any) {
    console.error("Retry job error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retry job" },
      { status: 500 }
    );
  }
}
