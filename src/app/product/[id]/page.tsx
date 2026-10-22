import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }], status: "APPROVED" },
    select: { title: true, description: true },
  });

  if (!product) return { title: "Product Not Found - Mojicart" };

  return {
    title: `${product.title} - Best Price Online | Mojicart`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      variants: true,
      category: {
        include: { parent: true },
      },
      brand: true,
      seller: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          rating: true,
          description: true,
          createdAt: true,
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      },
    },
  });

  if (!product || product.status !== "APPROVED") {
    notFound();
  }

  // Fetch related products in the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "APPROVED",
    },
    include: {
      images: { take: 1 },
      seller: { select: { storeName: true } },
    },
    take: 4,
  });

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
