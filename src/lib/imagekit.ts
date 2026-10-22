import ImageKit from "imagekit";

const IMAGEKIT_PUBLIC_KEY =
  process.env.IMAGEKIT_PUBLIC_KEY || "public_Ggs+q1lx02bQCXIiY7D6X76ipJY=";
const IMAGEKIT_PRIVATE_KEY =
  process.env.IMAGEKIT_PRIVATE_KEY || "private_q2Htp9V6cZdS0Put3f67JbgfxUo=";
const IMAGEKIT_URL_ENDPOINT =
  process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/5lxb3822q";

export const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

export interface UploadOptions {
  file: Buffer | string; // base64, buffer, or remote URL
  fileName: string;
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
}

export interface ImageKitUploadResult {
  fileId: string;
  name: string;
  url: string;
  compressedUrl: string;
  size: number;
  width?: number;
  height?: number;
}

/**
 * Upload an image to ImageKit with automatic compression URL generation
 */
export async function uploadImageToImageKit(
  options: UploadOptions
): Promise<ImageKitUploadResult> {
  const folder = options.folder || "/mojicart/products";
  const fileData =
    Buffer.isBuffer(options.file) ? options.file.toString("base64") : options.file;

  const res = await imagekit.upload({
    file: fileData,
    fileName: options.fileName,
    folder,
    tags: options.tags || ["mojicart", "compressed"],
    useUniqueFileName: options.useUniqueFileName ?? true,
  });

  // Construct optimized, compressed CDN URL with modern WebP/AVIF auto-format & 80% compression quality
  const compressedUrl = getCompressedImageUrl(res.url, { quality: 80, format: "auto" });

  return {
    fileId: res.fileId,
    name: res.name,
    url: res.url,
    compressedUrl,
    size: res.size,
    width: res.width,
    height: res.height,
  };
}

/**
 * Generates an ImageKit optimized, compressed image URL with transformations
 */
export function getCompressedImageUrl(
  url: string,
  options: {
    quality?: number;
    width?: number;
    height?: number;
    format?: string;
  } = {}
): string {
  if (!url) return "";

  const quality = options.quality || 80;
  const format = options.format || "auto";

  // Build transform string
  const transforms: string[] = [`q-${quality}`, `f-${format}`];
  if (options.width) transforms.push(`w-${options.width}`);
  if (options.height) transforms.push(`h-${options.height}`);
  const transformStr = `tr:${transforms.join(",")}`;

  // If already an ImageKit URL for this endpoint
  if (url.includes("ik.imagekit.io/5lxb3822q")) {
    // If it already has a transformation segment, replace or keep
    if (url.includes("/tr:")) {
      return url;
    }
    return url.replace(
      "https://ik.imagekit.io/5lxb3822q/",
      `https://ik.imagekit.io/5lxb3822q/${transformStr}/`
    );
  }

  return url;
}

export default imagekit;
