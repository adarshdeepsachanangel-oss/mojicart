import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "ALL";
    const format = searchParams.get("format"); // "csv" or json
    const search = searchParams.get("q") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { sourceUrl: { contains: search } },
        { sourceProductId: { contains: search } },
      ];
    }

    if (format === "csv") {
      const items = await prisma.importItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      const csvHeader = [
        "Item ID",
        "Job ID",
        "Source URL",
        "Source Product ID",
        "Title",
        "Status",
        "Source Price",
        "Images Found",
        "Images Downloaded",
        "Product ID",
        "Error Details",
        "Created At",
      ].join(",");

      const csvRows = items.map((i) =>
        [
          `"${i.id}"`,
          `"${i.jobId}"`,
          `"${i.sourceUrl}"`,
          `"${i.sourceProductId || ""}"`,
          `"${(i.title || "").replace(/"/g, '""')}"`,
          `"${i.status}"`,
          `"${i.sourcePrice || 0}"`,
          `"${i.imagesFound}"`,
          `"${i.imagesDownloaded}"`,
          `"${i.productId || ""}"`,
          `"${(i.errorDetails || "").replace(/"/g, '""')}"`,
          `"${i.createdAt.toISOString()}"`,
        ].join(",")
      );

      const csvString = [csvHeader, ...csvRows].join("\n");
      return new Response(csvString, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="mojicart-meesho-import-history-${Date.now()}.csv"`,
        },
      });
    }

    const [items, total, totalJobs, statsGroup] = await Promise.all([
      prisma.importItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.importItem.count({ where }),
      prisma.importJob.count(),
      prisma.importItem.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const s of statsGroup) {
      statusCounts[s.status] = s._count.id;
    }

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalItems: total,
        totalJobs,
        byStatus: statusCounts,
      },
    });
  } catch (error: any) {
    console.error("Import history error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch import history" },
      { status: 500 }
    );
  }
}
