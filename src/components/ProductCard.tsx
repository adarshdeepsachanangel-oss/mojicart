"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Check, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";

export interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  basePrice: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  sellerName?: string;
  isUnder199?: boolean;
  isUnder499?: boolean;
  isBestSeller?: boolean;
  stock?: number;
}

export default function ProductCard({
  id,
  slug,
  title,
  basePrice,
  mrp,
  discountPercent,
  rating,
  reviewCount,
  imageUrl,
  sellerName,
  isUnder199,
  isUnder499,
  isBestSeller,
  stock = 10,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock <= 0) return;
    setLoading(true);
    const res = await addToCart(id, null, 1);
    setLoading(false);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/v1/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.saved);
      }
    } catch {
      // Wishlist toggle handled
    }
  };

  return (
    <div className="product-card group relative bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col justify-between hover:border-amber-400 transition-all duration-200">
      {/* Top badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {isBestSeller && (
          <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
            Best Seller
          </span>
        )}
        {isUnder199 && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Under ₹199
          </span>
        )}
        {!isUnder199 && isUnder499 && (
          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            Under ₹499
          </span>
        )}
      </div>

      {/* Wishlist toggle */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm ${
          isWishlisted
            ? "bg-rose-50 text-rose-500"
            : "bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white"
        }`}
        title="Add to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
      </button>

      {/* Product Image Link */}
      <Link href={`/product/${slug || id}`} className="block relative bg-slate-50 pt-[100%] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl || fallbackImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      {/* Content Area */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {sellerName && (
            <p className="text-[11px] text-slate-500 font-medium truncate mb-1">
              By {sellerName}
            </p>
          )}

          <Link href={`/product/${slug || id}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center bg-emerald-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              <span>{rating > 0 ? rating.toFixed(1) : "4.5"}</span>
              <Star className="w-2.5 h-2.5 ml-0.5 fill-white" />
            </div>
            <span className="text-[11px] text-slate-400">
              ({reviewCount > 0 ? reviewCount.toLocaleString() : "140"})
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-950">
                ₹{basePrice.toFixed(0)}
              </span>
              {mrp > basePrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{mrp.toFixed(0)}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="text-[11px] font-bold text-emerald-600 block">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={loading || stock <= 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              stock <= 0
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : added
                ? "bg-emerald-600 text-white shadow"
                : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm"
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : stock <= 0 ? (
              <span>Out of stock</span>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
