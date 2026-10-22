"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Tag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, finalTotal, totalItems, updateQuantity, removeItem, loading } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const freeShippingThreshold = 499.0;
  const amountNeededForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const freeShipPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/v1/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartSubtotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponApplied(data.coupon);
        setCouponError("");
      } else {
        setCouponError(data.error || "Invalid coupon");
        setCouponApplied(null);
      }
    } catch {
      setCouponError("Failed to apply coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountAmount = couponApplied ? couponApplied.discountAmount : 0;
  const payableAmount = Math.max(0, finalTotal - discountAmount);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-semibold text-slate-500">Loading your shopping cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Your Mojicart Cart is Empty
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
          Explore today&apos;s lightning deals, festive ethnic collections, and under ₹199 budget specials!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm shadow transition"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-amber-500" />
        <span>Shopping Cart ({totalItems} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Milestone Progress Bar */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Truck className="w-4 h-4 text-amber-600" />
                {amountNeededForFreeShip > 0
                  ? `Add ₹${amountNeededForFreeShip.toFixed(0)} more for FREE Delivery`
                  : "🎉 You qualify for FREE Delivery across India!"}
              </span>
              <span className="text-amber-800">{freeShipPercent}%</span>
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${freeShipPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex gap-4 sm:gap-6 items-start">
                {/* Product Thumbnail */}
                <Link
                  href={`/product/${item.productId}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                    <div>
                      {item.seller && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Sold by {item.seller.storeName}
                        </p>
                      )}
                      <Link
                        href={`/product/${item.productId}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 line-clamp-2 transition"
                      >
                        {item.title}
                      </Link>
                      {item.variantTitle && (
                        <span className="inline-block mt-1 text-[11px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                          {item.variantTitle}
                        </span>
                      )}
                    </div>

                    <div className="text-left sm:text-right mt-1 sm:mt-0">
                      <p className="text-base font-black text-slate-950">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </p>
                      {item.mrp > item.price && (
                        <p className="text-xs text-slate-400 line-through">
                          ₹{(item.mrp * item.quantity).toFixed(0)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Out of Stock Alert */}
                  {item.isOutOfStock && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold mt-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Out of stock. Please remove to proceed.</span>
                    </div>
                  )}

                  {/* Quantity & Delete Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                        title="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-black text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <Link href="/" className="font-semibold text-amber-600 hover:underline">
              ← Add more items
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Apply Coupon / Promotion
              </h3>
            </div>

            {couponApplied ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon {couponApplied.code} Applied</span>
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    Saved ₹{couponApplied.discountAmount.toFixed(0)} on your order!
                  </p>
                </div>
                <button
                  onClick={() => setCouponApplied(null)}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. WELCOME100)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full uppercase text-xs font-semibold tracking-wider border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition shrink-0"
                  >
                    {validatingCoupon ? "Checking..." : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{couponError}</p>
                )}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  <span
                    onClick={() => setCouponCode("WELCOME100")}
                    className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-100 transition"
                  >
                    WELCOME100 (₹100 Off)
                  </span>
                  <span
                    onClick={() => setCouponCode("MOJI15")}
                    className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-100 transition"
                  >
                    MOJI15 (15% Off)
                  </span>
                </div>
              </form>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wide text-slate-900 pb-3 border-b border-slate-100">
              Price Details
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Price ({totalItems} items)</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(0)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toFixed(0)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    <span className="font-semibold text-slate-900">₹{shippingFee}</span>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-sm text-slate-900">Total Payable</span>
              <span className="text-xl font-black text-slate-950">
                ₹{payableAmount.toFixed(0)}
              </span>
            </div>

            <button
              onClick={() => {
                const params = new URLSearchParams();
                if (couponApplied) params.set("coupon", couponApplied.code);
                router.push(`/checkout?${params.toString()}`);
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-sm shadow flex items-center justify-center gap-2 transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe and Secure 256-Bit SSL Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
