import ImageKit from "imagekit";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_Ggs+q1lx02bQCXIiY7D6X76ipJY=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_q2Htp9V6cZdS0Put3f67JbgfxUo=",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/5lxb3822q",
});

function getCompressedUrl(rawUrl) {
  if (rawUrl.includes("ik.imagekit.io/5lxb3822q")) {
    if (rawUrl.includes("/tr:")) return rawUrl;
    return rawUrl.replace(
      "https://ik.imagekit.io/5lxb3822q/",
      "https://ik.imagekit.io/5lxb3822q/tr:q-80,f-auto/"
    );
  }
  return rawUrl;
}

async function main() {
  console.log("=== Mojicart ImageKit Migration & Cloud Compression ===");

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
  const localMap = new Map(); // filename -> imagekit compressed url

  // 1. Upload local product images
  if (fs.existsSync(uploadsDir)) {
    const files = fs
      .readdirSync(uploadsDir)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
    console.log(`Found ${files.length} local images in public/uploads/products.`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(uploadsDir, file);
      try {
        const buffer = fs.readFileSync(filePath);
        const res = await imagekit.upload({
          file: buffer.toString("base64"),
          fileName: file,
          folder: "/mojicart/products",
          useUniqueFileName: false,
          tags: ["mojicart", "compressed"],
        });

        const compressedUrl = getCompressedUrl(res.url);
        localMap.set(file, compressedUrl);
        localMap.set(`/uploads/products/${file}`, compressedUrl);

        if ((i + 1) % 10 === 0 || i + 1 === files.length) {
          console.log(`[${i + 1}/${files.length}] Uploaded & compressed: ${file}`);
        }
      } catch (err) {
        console.warn(`Failed to upload ${file}:`, err.message);
      }
    }
  }

  // 2. Update ProductImage records in database
  const productImages = await prisma.productImage.findMany();
  console.log(`Scanning ${productImages.length} ProductImage records in database...`);

  let updatedCount = 0;
  for (const img of productImages) {
    let newUrl = null;

    if (localMap.has(img.url)) {
      newUrl = localMap.get(img.url);
    } else {
      // Check if filename matches
      const basename = path.basename(img.url);
      if (localMap.has(basename)) {
        newUrl = localMap.get(basename);
      } else if (img.url.startsWith("http") && !img.url.includes("imagekit.io")) {
        // Upload remote image to ImageKit as well
        try {
          const res = await imagekit.upload({
            file: img.url,
            fileName: `remote_${Date.now()}_${basename}.jpg`,
            folder: "/mojicart/products",
            tags: ["mojicart", "remote_compressed"],
          });
          newUrl = getCompressedUrl(res.url);
          console.log(`Uploaded remote image ${img.id} to ImageKit: ${newUrl}`);
        } catch (err) {
          // Keep original if external fetch fails
        }
      }
    }

    if (newUrl && newUrl !== img.url) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: newUrl },
      });
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} ProductImage records to ImageKit compressed URLs.`);

  // 3. Update CMS Banners
  const banners = await prisma.cMSBanner.findMany();
  for (const b of banners) {
    if (!b.imageUrl.includes("imagekit.io")) {
      try {
        const res = await imagekit.upload({
          file: b.imageUrl,
          fileName: `banner_${b.id}.jpg`,
          folder: "/mojicart/banners",
          tags: ["mojicart", "banner"],
        });
        const compressedUrl = getCompressedUrl(res.url);
        await prisma.cMSBanner.update({
          where: { id: b.id },
          data: { imageUrl: compressedUrl },
        });
        console.log(`Updated CMS Banner ${b.id} to ImageKit URL: ${compressedUrl}`);
      } catch (err) {
        console.warn(`Could not upload banner ${b.id}:`, err.message);
      }
    }
  }

  console.log("=== ImageKit Cloud Migration Complete! ===");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
