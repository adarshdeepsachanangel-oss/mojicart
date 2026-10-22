import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";

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
    const job = await prisma.importJob.findUnique({ where: { id } });

    if (!job) {
      return NextResponse.json({ error: "Import job not found" }, { status: 404 });
    }

    await prisma.importItem.updateMany({
      where: {
        jobId: id,
        status: { in: ["QUEUED", "FETCHING"] },
      },
      data: { status: "CANCELLED" },
    });

    const updatedJob = await prisma.importJob.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      message: "Import job successfully cancelled.",
      job: updatedJob,
    });
  } catch (error: any) {
    console.error("Cancel job error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to cancel job" },
      { status: 500 }
    );
  }
}
