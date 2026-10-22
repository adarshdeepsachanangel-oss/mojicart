import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { validateBulkUrls } from "@/lib/importer/meesho/urlValidator";
import { MeeshoScraperService } from "@/lib/importer/meesho/scraperService";
import { suggestCategory } from "@/lib/importer/meesho/categoryMapper";
import { detectDuplicate } from "@/lib/importer/meesho/duplicateDetector";
import { saveImportedMeeshoProduct } from "@/lib/importer/meesho/productSaver";

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
    const { urls = [], autoPublish = false, categoryId } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Please provide a non-empty array of Meesho product URLs." },
        { status: 400 }
      );
    }

    // Limit batch size to 50 URLs max per job to prevent excessive timeouts
    const MAX_BATCH_SIZE = 50;
    if (urls.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch limit exceeded. Maximum ${MAX_BATCH_SIZE} URLs allowed per batch.` },
        { status: 400 }
      );
    }

    const { valid, invalid, duplicates } = validateBulkUrls(urls);

    if (valid.length === 0) {
      return NextResponse.json(
        {
          error: "No valid Meesho URLs found in batch.",
          invalid,
          duplicates,
        },
        { status: 400 }
      );
    }

    // Create the batch job
    const job = await prisma.importJob.create({
      data: {
        source: "MEESHO",
        status: "PROCESSING",
        totalUrls: valid.length,
        createdById: user.id,
      },
    });

    // Create item records
    const itemRecords = await Promise.all(
      valid.map((v) =>
        prisma.importItem.create({
          data: {
            jobId: job.id,
            sourceUrl: v.normalizedUrl,
            sourceProductId: v.productId,
            status: "QUEUED",
          },
        })
      )
    );

    // Process job items asynchronously
    // Background worker execution: does not block the response
    (async () => {
      const scraper = new MeeshoScraperService();
      let processed = 0;
      let success = 0;
      let failed = 0;
      let skipped = 0;

      for (const item of itemRecords) {
        // Check if job was cancelled
        const currentJob = await prisma.importJob.findUnique({ where: { id: job.id } });
        if (currentJob?.status === "CANCELLED") {
          await prisma.importItem.updateMany({
            where: { jobId: job.id, status: "QUEUED" },
            data: { status: "CANCELLED" },
          });
          break;
        }

        try {
          await prisma.importItem.update({
            where: { id: item.id },
            data: { status: "FETCHING" },
          });

          // Duplicate check first
          const duplicate = await detectDuplicate(item.sourceUrl, item.sourceProductId || undefined);
          if (duplicate.isDuplicate && duplicate.existingProduct) {
            await prisma.importItem.update({
              where: { id: item.id },
              data: {
                status: "DUPLICATE_SKIPPED",
                isDuplicate: true,
                existingProductId: duplicate.existingProduct.id,
                title: duplicate.existingProduct.title,
              },
            });
            skipped++;
            processed++;
            await prisma.importJob.update({
              where: { id: job.id },
              data: { processedCount: processed, skippedCount: skipped },
            });
            continue;
          }

          // Scrape product
          const scraped = await scraper.scrapeSingleProduct(item.sourceUrl);

          await prisma.importItem.update({
            where: { id: item.id },
            data: {
              status: "EXTRACTED",
              title: scraped.normalized.title,
              sourcePrice: scraped.normalized.pricing.sourcePrice,
              sourceMrp: scraped.normalized.pricing.sourceMrp,
              imagesFound: scraped.normalized.images.length,
              extractedData: JSON.stringify(scraped.normalized),
            },
          });

          // Category suggestion
          let targetCatId = categoryId;
          if (!targetCatId) {
            const suggested = await suggestCategory(
              scraped.normalized.categoryHint,
              scraped.normalized.title
            );
            targetCatId = suggested?.categoryId;
          }

          // Save product
          await prisma.importItem.update({
            where: { id: item.id },
            data: { status: "SAVING_PRODUCT" },
          });

          const { product: savedProduct } = await saveImportedMeeshoProduct(
            scraped.normalized,
            {
              status: autoPublish ? "APPROVED" : "DRAFT",
              categoryId: targetCatId,
              jobId: job.id,
            }
          );

          const finalItemStatus =
            savedProduct.status === "APPROVED" ? "PUBLISHED" : "IMPORTED_DRAFT";

          await prisma.importItem.update({
            where: { id: item.id },
            data: {
              status: finalItemStatus,
              productId: savedProduct.id,
              imagesDownloaded: savedProduct.images?.length || 0,
            },
          });

          success++;
        } catch (itemErr: any) {
          failed++;
          console.error(`Item ${item.sourceUrl} error:`, itemErr);
          await prisma.importItem.update({
            where: { id: item.id },
            data: {
              status: "FAILED",
              errorDetails: itemErr?.message || "Extraction or import failed",
            },
          });
        } finally {
          processed++;
          await prisma.importJob.update({
            where: { id: job.id },
            data: {
              processedCount: processed,
              successCount: success,
              failedCount: failed,
            },
          });
        }
      }

      // Mark job completed
      const finalStatus =
        failed === valid.length ? "FAILED" : failed > 0 ? "PARTIAL" : "COMPLETED";

      await prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: finalStatus,
          processedCount: processed,
          successCount: success,
          failedCount: failed,
          skippedCount: skipped,
        },
      });
    })().catch((err) => {
      console.error("Batch background error:", err);
    });

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: "PROCESSING",
        totalUrls: valid.length,
        validCount: valid.length,
        invalidCount: invalid.length,
        duplicatesCount: duplicates.length,
        invalid,
      },
    });
  } catch (error: any) {
    console.error("Bulk import job creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create bulk import job" },
      { status: 500 }
    );
  }
}
