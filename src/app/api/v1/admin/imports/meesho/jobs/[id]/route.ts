import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";

export async function GET(
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
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Import job not found" }, { status: 404 });
    }

    // Compute detailed stats
    const stats = {
      total: job.totalUrls,
      processed: job.processedCount,
      success: job.successCount,
      failed: job.failedCount,
      skipped: job.skippedCount,
      published: job.items.filter((i) => i.status === "PUBLISHED").length,
      drafts: job.items.filter((i) => i.status === "IMPORTED_DRAFT").length,
      pending: job.items.filter((i) => ["QUEUED", "FETCHING", "EXTRACTED", "SAVING_PRODUCT"].includes(i.status)).length,
    };

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        source: job.source,
        status: job.status,
        stats,
        items: job.items,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch job" },
      { status: 500 }
    );
  }
}
