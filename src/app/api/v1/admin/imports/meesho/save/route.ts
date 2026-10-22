import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";
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
    const { product, options = {} } = body;

    if (!product || !product.sourceUrl) {
      return NextResponse.json(
        { error: "Invalid product data supplied for saving." },
        { status: 400 }
      );
    }

    // Create an audit job for this single import
    const job = await prisma.importJob.create({
      data: {
        source: "MEESHO",
        status: "PROCESSING",
        totalUrls: 1,
        createdById: user.id,
      },
    });

    const importItem = await prisma.importItem.create({
      data: {
        jobId: job.id,
        sourceUrl: product.sourceUrl,
        sourceProductId: product.sourceProductId,
        title: options.customTitle || product.title,
        status: "SAVING_PRODUCT",
        sourcePrice: product.pricing?.sourcePrice,
        sourceMrp: product.pricing?.sourceMrp,
        imagesFound: product.images?.length || 0,
        extractedData: JSON.stringify(product),
      },
    });

    try {
      const { product: savedProduct, isUpdate } = await saveImportedMeeshoProduct(
        product,
        {
          ...options,
          jobId: job.id,
        }
      );

      const finalStatus =
        savedProduct.status === "APPROVED" ? "PUBLISHED" : "IMPORTED_DRAFT";

      await prisma.importItem.update({
        where: { id: importItem.id },
        data: {
          status: finalStatus,
          productId: savedProduct.id,
          imagesDownloaded: savedProduct.images?.length || 0,
        },
      });

      await prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          processedCount: 1,
          successCount: 1,
        },
      });

      return NextResponse.json({
        success: true,
        product: savedProduct,
        isUpdate,
        jobId: job.id,
        itemId: importItem.id,
      });
    } catch (saveError: any) {
      await prisma.importItem.update({
        where: { id: importItem.id },
        data: {
          status: "FAILED",
          errorDetails: saveError.message || "Failed during product saving",
        },
      });

      await prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          processedCount: 1,
          failedCount: 1,
          errorMessage: saveError.message,
        },
      });

      throw saveError;
    }
  } catch (error: any) {
    console.error("Save imported product error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save product" },
      { status: 500 }
    );
  }
}
