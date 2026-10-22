import Link from "next/link";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ComingSoonNotify from "@/components/ComingSoonNotify";
import {
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Clock,
  Package,
  ShieldCheck,
  Truck,
  Layers,
  ShoppingBag,
} from "lucide-react";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Fetch category by slug or fallback search
  let category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { where: { isActive: true } },
      parent: true,
    },
  });

  if (!category) {
    category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: { contains: slug } },
          { name: { contains: slug.replace(/-/g, " ") } },
        ],
      },
      include: {
        children: { where: { isActive: true } },
        parent: true,
      },
    });
  }

  // Fallback title if not in DB
  const formattedSlugTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  let title = category?.name || formattedSlugTitle;
  let description =
    category?.description ||
    `Browse wholesale Indian direct-from-manufacturer collections in ${title}`;

  // 2. Fetch products
  let products: any[] = [];

  if (slug === "under-199") {
    title = "Under ₹199 Super Budget Zone";
    description =
      "Unbeatable direct-from-manufacturer accessories, jewelry & kitchen utilities";
    products = await prisma.product.findMany({
      where: { status: "APPROVED", isUnder199: true },
      include: {
        images: { take: 1, orderBy: { displayOrder: "asc" } },
        seller: { select: { storeName: true } },
      },
      take: 24,
    });
  } else if (slug === "under-499") {
    title = "Under ₹499 Best Deals";
    description =
      "Trending ethnic wear, home decor, electronics accessories and daily essentials";
    products = await prisma.product.findMany({
      where: { status: "APPROVED", isUnder499: true },
      include: {
        images: { take: 1, orderBy: { displayOrder: "asc" } },
        seller: { select: { storeName: true } },
      },
      take: 24,
    });
  } else if (category) {
    products = await prisma.product.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { categoryId: category.id },
          { category: { parentId: category.id } },
        ],
      },
      include: {
        images: { take: 1, orderBy: { displayOrder: "asc" } },
        seller: { select: { storeName: true } },
      },
      take: 24,
    });
  }

  // 3. If products are empty, fetch alternative stocked categories and trending items
  let activeCategories: any[] = [];
  let trendingProducts: any[] = [];

  if (products.length === 0) {
    [activeCategories, trendingProducts] = await Promise.all([
      prisma.category.findMany({
        where: {
          isActive: true,
          level: 1,
          slug: { not: slug },
        },
        include: {
          _count: { select: { products: true } },
        },
        take: 6,
      }),
      prisma.product.findMany({
        where: { status: "APPROVED" },
        include: {
          images: { take: 1, orderBy: { displayOrder: "asc" } },
          seller: { select: { storeName: true } },
        },
        orderBy: { reviewCount: "desc" },
        take: 8,
      }),
    ]);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4 flex-wrap">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/categories" className="hover:text-amber-600">Categories</Link>
        {category?.parent && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/category/${category.parent.slug}`}
              className="hover:text-amber-600"
            >
              {category.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">{title}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className="bg-gradient-to-r from-[#131921] to-[#232f3e] rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-md">
        <div className="max-w-2xl">
          <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block">
            {products.length === 0 ? "Upcoming Collection" : "Explore Collection"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 leading-tight flex items-center gap-2">
            {slug === "under-199" && <Sparkles className="w-6 h-6 text-rose-400" />}
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5">{description}</p>
          )}
        </div>

        {/* Subcategories pill bar if any */}
        {category?.children && category.children.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-700/60">
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.slug}`}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* When no products are available: Rich "Products are coming soon" state */}
      {products.length === 0 ? (
        <div className="space-y-10">
          {/* Main Coming Soon Banner Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
            {/* Background glowing gradient accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-amber-200/70">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Restocking & Quality Curation</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                Products are coming soon in {title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                We are actively onboarding verified Indian manufacturers, weavers, and craft workshops to bring direct factory-rate catalog items for <span className="font-semibold text-slate-800">{title}</span>. Our moderation team is currently auditing initial batches for 100% quality compliance.
              </p>

              {/* VIP Notify Me Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
                <p className="text-xs font-bold text-slate-800 mb-2">
                  Want an alert when products go live in this category?
                </p>
                <ComingSoonNotify categoryName={title} />
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-left">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
                  <Package className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Direct Factory Pricing</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Zero middlemen markups guaranteed</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">7-Step Quality Check</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Every unit physically inspected</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
                  <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Express Delivery</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Free shipping on orders above ₹499</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-5 py-2.5 rounded-xl transition shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl transition shadow"
                >
                  <Layers className="w-3.5 h-3.5" /> Browse All Categories
                </Link>
              </div>
            </div>
          </div>

          {/* Alternative Active Categories */}
          {activeCategories.length > 0 && (
            <div className="bg-slate-100/70 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>Explore In-Stock Categories with Live Products</span>
                </h3>
                <Link
                  href="/categories"
                  className="text-xs font-bold text-amber-600 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {activeCategories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="bg-white rounded-xl p-3 border border-slate-200 hover:border-amber-400 hover:shadow transition text-center group"
                  >
                    <p className="font-bold text-xs text-slate-900 group-hover:text-amber-600 transition truncate">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {c._count.products > 0
                        ? `${c._count.products} products live`
                        : "Coming soon"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Meanwhile, Trending Products from Other Categories */}
          {trendingProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    🔥 Trending Best Sellers Across Bharat
                  </h3>
                  <p className="text-xs text-slate-500">
                    Popular top-rated items with instant dispatch & cash on delivery
                  </p>
                </div>
                <Link
                  href="/search?bestSeller=true"
                  className="text-xs font-bold text-amber-600 hover:underline"
                >
                  View All Best Sellers
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {trendingProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    id={prod.id}
                    slug={prod.slug}
                    title={prod.title}
                    basePrice={prod.basePrice}
                    mrp={prod.mrp}
                    discountPercent={prod.discountPercent}
                    rating={prod.rating}
                    reviewCount={prod.reviewCount}
                    imageUrl={prod.images[0]?.url}
                    sellerName={prod.seller?.storeName}
                    isBestSeller={prod.isBestSeller}
                    isUnder199={prod.isUnder199}
                    isUnder499={prod.isUnder499}
                    stock={prod.stock}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Products Grid When Category Has Products */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-slate-900">
              Available Products ({products.length})
            </h2>
            <Link
              href={`/search?category=${slug}`}
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              Open Advanced Filters
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                id={prod.id}
                slug={prod.slug}
                title={prod.title}
                basePrice={prod.basePrice}
                mrp={prod.mrp}
                discountPercent={prod.discountPercent}
                rating={prod.rating}
                reviewCount={prod.reviewCount}
                imageUrl={prod.images[0]?.url}
                sellerName={prod.seller?.storeName}
                isBestSeller={prod.isBestSeller}
                isUnder199={prod.isUnder199}
                isUnder499={prod.isUnder499}
                stock={prod.stock}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
