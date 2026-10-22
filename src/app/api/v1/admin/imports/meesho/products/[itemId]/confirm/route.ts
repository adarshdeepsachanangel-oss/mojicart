import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth";
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

    if (!item.extractedData) {
      return NextResponse.json(
        { error: "Item has no extracted data to confirm. Run fetch first." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const normalized = JSON.parse(item.extractedData);

    const { product: savedProduct } = await saveImportedMeeshoProduct(normalized, {
      ...body,
      jobId: item.jobId,
      allowUpdateDuplicate: true,
    });

    const finalStatus =
      savedProduct.status === "APPROVED" ? "PUBLISHED" : "IMPORTED_DRAFT";

    await prisma.importItem.update({
      where: { id: itemId },
      data: {
        status: finalStatus,
        productId: savedProduct.id,
        imagesDownloaded: savedProduct.images?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product confirmed and saved successfully",
      product: savedProduct,
    });
  } catch (error: any) {
    console.error("Confirm product error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to confirm product" },
      { status: 500 }
    );
  }
}
