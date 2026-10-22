"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Filter, SlidersHorizontal, Star, X, Loader2, ArrowUpDown } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const brandParam = searchParams.get("brand") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const sortParam = searchParams.get("sort") || "relevance";
  const featuredParam = searchParams.get("featured") === "true";
  const bestSellerParam = searchParams.get("bestSeller") === "true";
  const under199Param = searchParams.get("under199") === "true";
  const under499Param = searchParams.get("under499") === "true";

  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  // Local filter states
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    // Fetch categories for filter sidebar
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.allCategories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    fetch(`/api/v1/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotalCount(data.pagination?.total || 0);
      })
      .catch((err) => console.error("Search fetch error:", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    router.push(`/search?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {query ? `Search results for "${query}"` : categoryParam ? `Category: ${categoryParam}` : "All Products"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {products.length} of {totalCount} items found
          </p>
        </div>

        {/* Sort Dropdown & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500 hidden sm:inline" />
            <span className="text-xs text-slate-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortParam}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="relevance">Featured & Relevant</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="popular">Best Sellers</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Left Filter Sidebar */}
        <aside
          className={`${
            mobileFilterOpen ? "block fixed inset-0 z-50 bg-black/50 p-4" : "hidden lg:block"
          }`}
        >
          <div
            className={`bg-white rounded-xl border border-slate-200 p-5 space-y-6 ${
              mobileFilterOpen ? "max-w-xs mx-auto max-h-[90vh] overflow-y-auto mt-10 shadow-2xl" : ""
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                Refine Search
              </span>
              {(categoryParam || minPriceParam || maxPriceParam || under199Param || under499Param) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-amber-600 hover:underline"
                >
                  Clear all
                </button>
              )}
              {mobileFilterOpen && (
                <button onClick={() => setMobileFilterOpen(false)} className="lg:hidden p-1">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              )}
            </div>

            {/* Quick Price Tier Shortcuts */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2.5">
                Special Price Zones
              </h4>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={under199Param}
                    onChange={(e) => updateParam("under199", e.target.checked ? "true" : "")}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-rose-600">Under ₹199 Store</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={under499Param}
                    onChange={(e) => updateParam("under499", e.target.checked ? "true" : "")}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-amber-600">Under ₹499 Store</span>
                </label>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2.5">
                Category
              </h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => updateParam("category", "")}
                  className={`w-full text-left py-1 px-2 rounded font-medium ${
                    !categoryParam ? "bg-amber-100 text-amber-900 font-bold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam("category", c.slug)}
                    className={`w-full text-left py-1 px-2 rounded truncate transition ${
                      categoryParam === c.slug
                        ? "bg-amber-100 text-amber-900 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter Form */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2.5">
                Price (₹)
              </h4>
              <form onSubmit={handleApplyPrice} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded text-xs transition"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Customer Rating
              </h4>
              <div className="space-y-1.5 text-xs">
                {[4, 3, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => updateParam("minRating", String(r))}
                    className="flex items-center gap-1.5 text-slate-700 hover:text-amber-600 py-1"
                  >
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">& Up</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
              <p className="text-sm font-semibold">Finding matching products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="min-h-[350px] bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">
                No matching products found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-5">
                We couldn&apos;t find any items matching your current filters. Try relaxing your price filters or searching with different terms.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">Loading products...</div>}>
      <SearchContent />
    </Suspense>
  );
}
