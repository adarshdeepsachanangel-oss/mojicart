"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingCart,
  Zap,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Store,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Share2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailClient({
  product,
  relatedProducts = [],
}: {
  product: any;
  relatedProducts: any[];
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Active Variant State
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants.length > 0 ? product.variants[0] : null
  );

  // Gallery state
  const images =
    product.images.length > 0
      ? product.images
      : [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" }];
  const [selectedImage, setSelectedImage] = useState(images[0].url);

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Pincode checker
  const [pincode, setPincode] = useState("110001");
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState("Delivery in 3 to 4 days");

  // Cart & Buy action states
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Review Form Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Current active price and stock
  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const discountPercent =
    currentMrp > currentPrice
      ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100)
      : 0;

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    if (variant.imageUrl) {
      setSelectedImage(variant.imageUrl);
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.length === 6) {
      setPincode(pincodeInput);
      setPincodeChecked(true);
      const days = pincodeInput.startsWith("11") ? 2 : 4;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      setDeliveryDate(
        `Fastest delivery by ${targetDate.toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}`
      );
    }
  };

  const handleAddToCart = async () => {
    if (currentStock <= 0) return;
    setAddingToCart(true);
    const res = await addToCart(product.id, selectedVariant?.id, quantity);
    setAddingToCart(false);
    if (res.success) {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    }
  };

  const handleBuyNow = async () => {
    if (currentStock <= 0) return;
    setAddingToCart(true);
    const res = await addToCart(product.id, selectedVariant?.id, quantity);
    setAddingToCart(false);
    if (res.success) {
      router.push("/checkout");
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const res = await fetch("/api/v1/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setWishlisted(data.saved);
      }
    } catch {
      // Wishlist toggle handled
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(`/product/${product.slug || product.id}`));
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setReviewSuccess(true);
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewSuccess(false);
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Parse specs if JSON
  let specsObj: Record<string, string> = {};
  try {
    if (product.specs) specsObj = JSON.parse(product.specs);
  } catch {
    // Specs raw text
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.category?.parent && (
          <>
            <Link href={`/category/${product.category.parent.slug}`} className="hover:text-amber-600">
              {product.category.parent.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <Link href={`/category/${product.category.slug}`} className="hover:text-amber-600">
          {product.category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-sm">
        {/* Left Column: Gallery (5 cols) */}
        <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[480px] shrink-0">
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition ${
                    selectedImage === img.url
                      ? "border-amber-500 ring-2 ring-amber-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={product.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Display Image */}
          <div className="flex-1 relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 aspect-square max-h-[500px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-md shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Center Column: Details & Pricing (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            {/* Brand & Seller */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold text-amber-600 uppercase tracking-wide">
                {product.brand?.name || "Mojicart Direct"}
              </span>
              <button
                onClick={handleToggleWishlist}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>{wishlisted ? "Wishlisted" : "Save"}</span>
              </button>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {product.title}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mt-3 pb-3 border-b border-slate-100">
              <div className="flex items-center bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded">
                <span>{product.rating > 0 ? product.rating.toFixed(1) : "4.8"}</span>
                <Star className="w-3 h-3 ml-1 fill-white" />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {product.reviewCount || 140} Ratings & Reviews
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase
              </span>
            </div>

            {/* Indian Price Stack */}
            <div className="mt-4 pb-4 border-b border-slate-100">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-950">
                  ₹{currentPrice.toFixed(0)}
                </span>
                {currentMrp > currentPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{currentMrp.toFixed(0)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Inclusive of all GST taxes. Free delivery on orders over ₹499.
              </p>
            </div>

            {/* Variants Selector */}
            {product.variants.length > 0 && (
              <div className="mt-4 pb-4 border-b border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Select Option:{" "}
                  <span className="text-amber-600">{selectedVariant?.title}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => handleVariantSelect(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        selectedVariant?.id === v.id
                          ? "border-amber-500 bg-amber-50 text-slate-950 ring-1 ring-amber-500"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {product.highlights && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Product Highlights
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  {product.highlights.split("\n").map((hl: string, i: number) => (
                    <li key={i}>{hl}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Seller Badge */}
          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase">Sold by</p>
                <p className="text-xs font-bold text-slate-900">{product.seller.storeName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded">
              <span>{product.seller.rating || "4.8"}</span>
              <Star className="w-2.5 h-2.5 fill-slate-950" />
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Box & Fulfillment (3 cols) */}
        <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            {/* Price Box */}
            <div className="pb-4 border-b border-slate-200">
              <span className="text-2xl font-black text-slate-950">
                ₹{(currentPrice * quantity).toFixed(0)}
              </span>
              <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> FREE Delivery on orders over ₹499
              </p>
            </div>

            {/* Pincode & Delivery Estimator */}
            <div className="mt-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold mb-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Deliver to: {pincode}</span>
              </div>
              <p className="text-xs text-slate-600 font-semibold mb-2">
                {deliveryDate}
              </p>
              <form onSubmit={handleCheckPincode} className="flex gap-1.5">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Check pincode"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1 rounded transition"
                >
                  Check
                </button>
              </form>
            </div>

            {/* Stock Status */}
            <div className="mt-4">
              {currentStock > 10 ? (
                <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  In Stock (Ready to Dispatch)
                </span>
              ) : currentStock > 0 ? (
                <span className="inline-block text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Only {currentStock} left in stock - order soon
                </span>
              ) : (
                <span className="inline-block text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Currently Out of Stock
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            {currentStock > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none"
                >
                  {[1, 2, 3, 4, 5].map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2.5">
            {cartSuccess && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold p-2.5 rounded-lg flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Added to cart successfully!</span>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || currentStock <= 0}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl text-xs sm:text-sm shadow flex items-center justify-center gap-2 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{currentStock <= 0 ? "Out of Stock" : "Add to Cart"}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={addingToCart || currentStock <= 0}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black py-3 rounded-xl text-xs sm:text-sm shadow flex items-center justify-center gap-2 transition"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Buy Now</span>
            </button>

            {/* Indian Trust Assurance Guarantee */}
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
                <span>7 Days Hassle-Free Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                <span>100% Original Brand Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-slate-700" />
                <span>Cash on Delivery Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl border border-slate-200 p-6">
        <div>
          <h3 className="text-base font-black text-slate-900 mb-3">
            Product Description
          </h3>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-1.5">
            {product.description ? (
              product.description.split("\n").map((line: string, idx: number) => {
                const trimmed = line.trim();
                if (!trimmed) {
                  return <div key={idx} className="h-1.5" />;
                }

                // 1. Standalone heading ending with a colon (e.g. "Sizes:", "Highlights:", "Description:")
                if (/^[A-Za-z0-9\s()&/_-]{2,35}:$/.test(trimmed)) {
                  return (
                    <div key={idx} className="font-bold text-slate-900 pt-1">
                      {trimmed}
                    </div>
                  );
                }

                // 2. Line with key-value format (e.g. "Name: Saree", "Saree Fabric: Georgette", "Country of Origin: India")
                const colonIdx = trimmed.indexOf(":");
                if (colonIdx > 0 && colonIdx <= 35) {
                  const labelPart = trimmed.slice(0, colonIdx);
                  const openP = (labelPart.match(/\(/g) || []).length;
                  const closeP = (labelPart.match(/\)/g) || []).length;
                  const isSizeLine = /^free\s+size/i.test(labelPart);

                  if (openP === closeP && !isSizeLine) {
                    const label = trimmed.slice(0, colonIdx + 1);
                    const rest = trimmed.slice(colonIdx + 1);
                    return (
                      <div key={idx}>
                        <span className="font-bold text-slate-900">{label}</span>
                        <span>{rest}</span>
                      </div>
                    );
                  }
                }

                // 3. Standard text paragraph
                return <div key={idx}>{line}</div>;
              })
            ) : (
              <p className="text-slate-400">No description provided.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-base font-black text-slate-900 mb-3">
            Technical Specifications
          </h3>
          {Object.keys(specsObj).length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              {Object.entries(specsObj).map(([key, value], idx) => (
                <div
                  key={key}
                  className={`flex p-2.5 ${
                    idx % 2 === 0 ? "bg-slate-50" : "bg-white"
                  }`}
                >
                  <span className="w-1/3 font-bold text-slate-700">{key}</span>
                  <span className="w-2/3 text-slate-600">{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Standard specifications apply.</p>
          )}
        </div>
      </div>

      {/* Verified Customer Reviews Section */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-black text-slate-900">Customer Reviews</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">
                {product.rating > 0 ? product.rating.toFixed(1) : "4.8"} out of 5
              </span>
              <span className="text-xs text-slate-400">
                ({product.reviews.length} ratings)
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="mt-6 space-y-4">
          {product.reviews.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              No written reviews yet. Be the first to share your thoughts on this product!
            </p>
          ) : (
            product.reviews.map((rev: any) => (
              <div key={rev.id} className="pb-4 border-b border-slate-100 last:border-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {rev.user.name[0]}
                    </div>
                    <span className="font-bold text-xs text-slate-800">{rev.user.name}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toISOString().split("T")[0]}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  {rev.title && <span className="font-bold text-xs text-slate-900">{rev.title}</span>}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-slate-900 mb-2">Write a Review</h3>
            <p className="text-xs text-slate-500 mb-4">{product.title}</p>

            {reviewSuccess ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center font-bold text-xs">
                Thank you! Your verified review has been submitted.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Rating:</label>
                  <div className="flex gap-2 text-amber-400 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Headline:</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="E.g., Exceptional quality, very comfortable!"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Written Review (Required):
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What did you like or dislike about this product? How was the fit and finish?"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2 rounded-lg text-xs transition"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Related Products Rail */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-black text-slate-900 mb-4">
            Customers Also Viewed
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                id={rel.id}
                slug={rel.slug}
                title={rel.title}
                basePrice={rel.basePrice}
                mrp={rel.mrp}
                discountPercent={rel.discountPercent}
                rating={rel.rating}
                reviewCount={rel.reviewCount}
                imageUrl={rel.images[0]?.url}
                sellerName={rel.seller?.storeName}
                stock={rel.stock}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
