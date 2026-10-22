import Link from "next/link";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { Sparkles, ArrowRight, Zap, Flame, ShieldCheck, Tag } from "lucide-react";


export default async function HomePage() {
  // Fetch dynamic CMS banners, active sections, categories, and products directly from database
  const [banners, categories, featuredProducts, bestSellers, budget199, budget499] =
    await Promise.all([
      prisma.cMSBanner.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.category.findMany({
        where: { isActive: true, level: 1 },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { status: "APPROVED", isFeatured: true },
        include: {
          images: { take: 1, orderBy: { displayOrder: "asc" } },
          seller: { select: { storeName: true } },
        },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: "APPROVED", isBestSeller: true },
        include: {
          images: { take: 1, orderBy: { displayOrder: "asc" } },
          seller: { select: { storeName: true } },
        },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: "APPROVED", isUnder199: true },
        include: {
          images: { take: 1, orderBy: { displayOrder: "asc" } },
          seller: { select: { storeName: true } },
        },
        take: 6,
      }),
      prisma.product.findMany({
        where: { status: "APPROVED", isUnder499: true },
        include: {
          images: { take: 1, orderBy: { displayOrder: "asc" } },
          seller: { select: { storeName: true } },
        },
        take: 6,
      }),
    ]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* 1. Hero Dynamic Promotional Banner Carousel / Slider */}
      <section className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Hero Card */}
          {banners.length > 0 && (
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-amber-600 to-rose-600 text-white min-h-[300px] sm:min-h-[380px] flex flex-col justify-end p-6 sm:p-10 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banners[0].imageUrl}
                alt={banners[0].title}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:scale-105 transition duration-700"
              />
              <div className="relative z-10 max-w-xl">
                {banners[0].tagText && (
                  <span className="inline-block bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                    {banners[0].tagText}
                  </span>
                )}
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white mb-2 drop-shadow-sm">
                  {banners[0].title}
                </h1>
                <p className="text-sm sm:text-base text-amber-100 font-medium mb-5 line-clamp-2">
                  {banners[0].subtitle}
                </p>
                <Link
                  href={banners[0].linkUrl}
                  className="inline-flex items-center gap-2 bg-white text-slate-950 hover:bg-amber-400 font-bold px-6 py-3 rounded-xl shadow transition"
                >
                  <span>Explore Festive Offers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Secondary Promotional Campaign Cards */}
          <div className="flex flex-col gap-4">
            {banners.slice(1, 3).map((b, idx) => (
              <div
                key={b.id || idx}
                className={`relative rounded-2xl overflow-hidden shadow p-6 flex flex-col justify-between flex-1 text-white group ${
                  idx === 0 ? "bg-gradient-to-br from-indigo-900 to-blue-700" : "bg-gradient-to-br from-rose-800 to-amber-700"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-105 transition duration-500"
                />
                <div className="relative z-10">
                  {b.tagText && (
                    <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2">
                      {b.tagText}
                    </span>
                  )}
                  <h3 className="text-lg font-black leading-snug mb-1 drop-shadow-sm">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-1">{b.subtitle}</p>
                </div>
                <div className="relative z-10 mt-4">
                  <Link
                    href={b.linkUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-amber-400 transition"
                  >
                    Shop Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Popular Categories Circle Tiles */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Explore Categories</span>
          </h2>
          <Link href="/categories" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center hover:border-amber-400 hover:shadow-md transition group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-600 mb-3 transition shadow-inner">
                <Tag className="w-8 h-8" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-amber-600 transition">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Explore Deals</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Meesho-Style Under ₹199 Super Budget Zone */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 rounded-2xl p-5 sm:p-7 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-rose-600 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Factory Direct Pricing
                </span>
                <span className="text-xs text-rose-100 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-white" /> 100% Quality Checked
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-300 fill-amber-300" />
                Under ₹199 Super Budget Zone
              </h2>
              <p className="text-xs sm:text-sm text-rose-100">
                Jewelry, phone accessories, kitchen items, and daily utilities at wholesale rates
              </p>
            </div>
            <Link
              href="/category/under-199"
              className="self-start sm:self-auto bg-white text-slate-900 hover:bg-amber-100 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition"
            >
              View All Under ₹199
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {budget199.map((prod) => (
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
                sellerName={prod.seller.storeName}
                isUnder199={true}
                stock={prod.stock}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Lightning Deals of the Day Rail */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                ⚡ Lightning Deals of the Day
              </h2>
              <p className="text-xs text-slate-500">
                Hand-picked top seller products with massive festival discounts
              </p>
            </div>
          </div>
          <Link
            href="/search?featured=true"
            className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
          >
            See all deals <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {featuredProducts.map((prod) => (
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
              sellerName={prod.seller.storeName}
              isBestSeller={prod.isBestSeller}
              isUnder499={prod.isUnder499}
              stock={prod.stock}
            />
          ))}
        </div>
      </section>

      {/* 5. Under ₹499 Best Seller Picks */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="bg-slate-900 rounded-2xl p-5 sm:p-7 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Pocket Friendly
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">
                Under ₹499 Best Sellers
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Bedsheets, spice racks, dupattas, and audio gadgets
              </p>
            </div>
            <Link
              href="/category/under-499"
              className="self-start sm:self-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Explore Store
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {budget499.map((prod) => (
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
                sellerName={prod.seller.storeName}
                isUnder499={true}
                stock={prod.stock}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Top Trending & Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-lg">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                🔥 Most Loved by Customers
              </h2>
              <p className="text-xs text-slate-500">
                Highest rated products with 4.5+ star verified purchase feedback
              </p>
            </div>
          </div>
          <Link
            href="/search?bestSeller=true"
            className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
          >
            View all best sellers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {bestSellers.map((prod) => (
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
              sellerName={prod.seller.storeName}
              isBestSeller={true}
              stock={prod.stock}
            />
          ))}
        </div>
      </section>

      {/* 7. Seller Hub Banner Call to Action */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 sm:p-10 text-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <span className="bg-slate-950 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Become a Mojicart Seller
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 leading-tight">
              Sell Directly to Millions of Shoppers Across India
            </h2>
            <p className="text-sm font-medium text-slate-900/80 mt-1">
              Lowest 10% commission, 7-day automated bank settlements, zero listing fees, and dedicated seller support.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/seller/register"
              className="bg-slate-950 hover:bg-slate-900 text-white font-bold px-6 py-3.5 rounded-xl shadow transition text-center"
            >
              Start Selling Today
            </Link>
            <Link
              href="/seller"
              className="bg-white/90 hover:bg-white text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-sm transition text-center"
            >
              Seller Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
