import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [banners, sections, categories] = await Promise.all([
      prisma.cMSBanner.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.homepageSection.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.category.findMany({
        where: { isActive: true, level: 1 },
        orderBy: { displayOrder: "asc" },
      }),
    ]);

    return NextResponse.json({
      banners,
      sections,
      categories,
    });
  } catch (error) {
    console.error("CMS GET error:", error);
    return NextResponse.json({ error: "Failed to fetch CMS content" }, { status: 500 });
  }
}
