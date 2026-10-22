import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { uploadImageToImageKit } from "@/lib/imagekit";
import { downloadAndStoreImage } from "@/lib/importer/meesho/imageDownloader";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. JSON payload with image URL
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { url } = body;
      if (!url || typeof url !== "string") {
        return NextResponse.json({ error: "Missing or invalid 'url' field" }, { status: 400 });
      }

      if (url.includes("ik.imagekit.io")) {
        return NextResponse.json({ success: true, url });
      }

      try {
        // Upload directly to ImageKit with auto-compression
        const ikRes = await uploadImageToImageKit({
          file: url,
          fileName: `admin_${Date.now()}.jpg`,
          folder: "/mojicart/products",
        });
        return NextResponse.json({ success: true, url: ikRes.compressedUrl });
      } catch (ikErr: any) {
        console.warn("ImageKit remote upload fallback:", ikErr.message);
        // Fallback to local storage if ImageKit fails
        const res = await downloadAndStoreImage(url, "custom");
        if (!res.success) {
          return NextResponse.json({ error: res.error || "Failed to download image" }, { status: 400 });
        }
        return NextResponse.json({ success: true, url: res.storedUrl });
      }
    }

    // 2. FormData file upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
      }

      try {
        // Upload buffer directly to ImageKit with automatic compression
        const ikRes = await uploadImageToImageKit({
          file: buffer,
          fileName: file.name || `upload_${Date.now()}.jpg`,
          folder: "/mojicart/products",
        });
        return NextResponse.json({ success: true, url: ikRes.compressedUrl });
      } catch (ikErr: any) {
        console.warn("ImageKit buffer upload fallback:", ikErr.message);
        // Local file fallback
        const ext = path.extname(file.name) || ".jpg";
        const hash = crypto.createHash("md5").update(buffer).digest("hex").slice(0, 10);
        const filename = `upload_${Date.now()}_${hash}${ext}`;

        const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);

        const storedUrl = `/uploads/products/${filename}`;
        return NextResponse.json({ success: true, url: storedUrl });
      }
    }

    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin upload error:", error);
    return NextResponse.json({ error: error?.message || "Failed to upload image" }, { status: 500 });
  }
}
