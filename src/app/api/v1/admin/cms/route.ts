import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [banners, sections] = await Promise.all([
      prisma.cMSBanner.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.homepageSection.findMany({ orderBy: { displayOrder: "asc" } }),
    ]);

    return NextResponse.json({ banners, sections });
  } catch (error) {
    console.error("Admin CMS GET error:", error);
    return NextResponse.json({ error: "Failed to fetch CMS items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { type, title, subtitle, imageUrl, linkUrl, tagText, displayOrder = 0, isActive = true } = body;

    if (type === "banner") {
      const banner = await prisma.cMSBanner.create({
        data: {
          title,
          subtitle,
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80",
          linkUrl: linkUrl || "/",
          tagText: tagText || null,
          displayOrder: parseInt(displayOrder),
          isActive,
        },
      });
      return NextResponse.json({ success: true, banner }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid CMS type" }, { status: 400 });
  } catch (error) {
    console.error("Admin CMS POST error:", error);
    return NextResponse.json({ error: "Failed to create CMS item" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, type, isActive, displayOrder, title, subtitle, imageUrl, linkUrl } = await req.json();

    if (type === "banner") {
      const updated = await prisma.cMSBanner.update({
        where: { id },
        data: {
          isActive: isActive !== undefined ? isActive : undefined,
          displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
          title: title || undefined,
          subtitle: subtitle || undefined,
          imageUrl: imageUrl || undefined,
          linkUrl: linkUrl || undefined,
        },
      });
      return NextResponse.json({ success: true, banner: updated });
    } else if (type === "section") {
      const updated = await prisma.homepageSection.update({
        where: { id },
        data: {
          isActive: isActive !== undefined ? isActive : undefined,
          displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
          title: title || undefined,
          subtitle: subtitle || undefined,
        },
      });
      return NextResponse.json({ success: true, section: updated });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Admin CMS PUT error:", error);
    return NextResponse.json({ error: "Failed to update CMS item" }, { status: 500 });
  }
}
