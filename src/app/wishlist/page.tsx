"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/v1/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemove = async (productId: string) => {
    try {
      await fetch("/api/v1/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      fetchWishlist();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Heart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to see your wishlist</h2>
        <p className="text-xs text-slate-500 mb-4">Save products you love and track price drops</p>
        <Link
          href="/login?redirect=/wishlist"
          className="inline-block bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>My Wishlist ({items.length} items)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Products you saved for later</p>
        </div>
        <Link href="/" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-bold">Loading wishlist...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-base mb-1">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 mb-4">Click the heart on any product to save it here</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs"
          >
            Explore Deals <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((it) => (
            <div
              key={it.id}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between"
            >
              <div>
                <Link
                  href={`/product/${it.product.slug || it.product.id}`}
                  className="block bg-slate-50 rounded-xl overflow-hidden aspect-square mb-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.product.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30"}
                    alt={it.product.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <Link
                  href={`/product/${it.product.slug || it.product.id}`}
                  className="font-bold text-xs text-slate-900 hover:text-amber-600 line-clamp-2"
                >
                  {it.product.title}
                </Link>
                <p className="font-black text-sm text-slate-950 mt-2">
                  ₹{it.product.basePrice.toFixed(0)}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => addToCart(it.product.id, null, 1)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                </button>
                <button
                  onClick={() => handleRemove(it.product.id)}
                  className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 transition"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
