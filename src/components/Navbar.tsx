"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  ChevronDown,
  Store,
  ShieldAlert,
  Sparkles,
  Menu,
  X,
  LogOut,
  Package,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems, subtotal } = useCart();

  if (pathname.startsWith("/admin")) return null;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pincode, setPincode] = useState("110001");
  const [pincodeCity, setPincodeCity] = useState("New Delhi");
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [tempPincode, setTempPincode] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    router.push(`/search?${params.toString()}`);
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPincode.length === 6) {
      setPincode(tempPincode);
      if (tempPincode.startsWith("11")) setPincodeCity("New Delhi");
      else if (tempPincode.startsWith("56")) setPincodeCity("Bengaluru");
      else if (tempPincode.startsWith("40")) setPincodeCity("Mumbai");
      else if (tempPincode.startsWith("70")) setPincodeCity("Kolkata");
      else setPincodeCity("India");
      setShowPincodeModal(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#131921] text-white shadow-md">
      {/* Top micro announcement bar */}
      <div className="bg-[#232f3e] text-xs py-1.5 px-4 text-slate-300 flex justify-between items-center border-b border-slate-700/60">
        <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-amber-500 text-slate-900 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
            Festive Offer
          </span>
          <span>Free delivery on orders above ₹499 | 100% Verified Indian Manufacturers</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <Link href="/seller" className="hover:text-amber-400 flex items-center gap-1 transition">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Sell on Mojicart</span>
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/track-order" className="hover:text-white transition">
            Track Order
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/help" className="hover:text-white transition">
            24x7 Help
          </Link>
        </div>
      </div>

      {/* Main Omnibar Header */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 md:gap-6">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white p-1"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex flex-col select-none group">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition">
                moji<span className="text-amber-500">cart</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-500/30">
                .in
              </span>
            </div>
            <span className="text-[9px] text-slate-400 tracking-wider -mt-1 hidden sm:inline">
              Bharat Ka Trusted Marketplace
            </span>
          </Link>
        </div>

        {/* Delivery Pincode Selector */}
        <button
          onClick={() => setShowPincodeModal(true)}
          className="hidden lg:flex items-center gap-1.5 text-left px-2 py-1.5 rounded hover:ring-1 hover:ring-white transition"
          title="Change delivery location"
        >
          <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs leading-tight">
            <p className="text-slate-400 text-[10px]">Delivering to</p>
            <p className="font-bold text-white text-[12px] flex items-center gap-0.5">
              {pincodeCity} {pincode}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </p>
          </div>
        </button>

        {/* Global Omnibox Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl flex items-center">
          <div className="relative flex w-full rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-500">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-100 text-slate-800 text-xs px-2.5 py-2.5 border-r border-slate-300 focus:outline-none hidden sm:block cursor-pointer font-medium"
            >
              <option value="">All Categories</option>
              <option value="women-ethnic">Women Ethnic</option>
              <option value="electronics">Electronics</option>
              <option value="home-kitchen">Home & Kitchen</option>
              <option value="under-199">Under ₹199</option>
              <option value="under-499">Under ₹499</option>
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for Kurtis, Earbuds, Bedsheets, Kitchenware & more..."
              className="w-full bg-white text-slate-900 text-sm px-3.5 py-2 focus:outline-none placeholder:text-slate-400"
            />

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-5 flex items-center justify-center transition font-semibold"
            >
              <Search className="w-4 h-4 text-slate-900" />
            </button>
          </div>
        </form>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-1 sm:gap-4 shrink-0">
          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:ring-1 hover:ring-white transition text-left"
            >
              <User className="w-5 h-5 text-slate-300" />
              <div className="hidden sm:block text-xs leading-tight">
                <p className="text-slate-400 text-[10px]">
                  {user ? `Hello, ${user.name.split(" ")[0]}` : "Sign In / Register"}
                </p>
                <p className="font-bold text-white text-[12px] flex items-center gap-0.5">
                  Account & Lists
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </p>
              </div>
            </button>

            {accountMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 py-2 z-50 text-sm animate-in fade-in"
                onMouseLeave={() => setAccountMenuOpen(false)}
              >
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <Package className="w-4 h-4 text-slate-500" />
                      My Orders
                    </Link>

                    {user.role === "SELLER" && (
                      <Link
                        href="/seller"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-amber-50 text-amber-700 font-medium"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <Store className="w-4 h-4 text-amber-600" />
                        Seller Dashboard
                      </Link>
                    )}

                    {["SUPER_ADMIN", "OPERATIONS_ADMIN", "CATALOG_MANAGER"].includes(user.role) && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-rose-700 font-medium"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        Super Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-3">
                    <Link
                      href="/login"
                      className="w-full block text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-lg text-sm mb-2 shadow-sm transition"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <p className="text-xs text-center text-slate-500">
                      New customer?{" "}
                      <Link
                        href="/register"
                        className="text-amber-600 hover:underline font-semibold"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        Start here
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded hover:ring-1 hover:ring-white transition"
          >
            <Heart className="w-5 h-5 text-slate-300" />
            <span className="text-xs font-semibold">Wishlist</span>
          </Link>

          {/* Cart Icon with Live Count Badge */}
          <Link
            href="/cart"
            className="flex items-center gap-2 bg-[#232f3e] hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600/60 transition group"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-amber-400 group-hover:scale-105 transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 font-black text-[11px] rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left text-xs leading-none">
              <p className="text-[10px] text-slate-400">Cart</p>
              <p className="font-bold text-amber-400 text-sm">₹{subtotal.toFixed(0)}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Subcategory Navigation Strip */}
      <nav className="bg-[#232f3e] px-4 py-2 text-xs font-medium border-t border-slate-700/60 overflow-x-auto scrollbar-none flex items-center gap-5 whitespace-nowrap">
        <Link
          href="/categories"
          className="flex items-center gap-1.5 text-white hover:text-amber-400 font-bold transition"
        >
          <Menu className="w-4 h-4" />
          <span>All Categories</span>
        </Link>
        <Link href="/category/under-199" className="text-rose-400 font-bold hover:underline flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>Under ₹199 Store</span>
        </Link>
        <Link href="/category/under-499" className="text-amber-400 font-bold hover:underline">
          Under ₹499 Best Deals
        </Link>
        <Link href="/category/women-ethnic" className="text-slate-200 hover:text-white transition">
          Women Ethnic & Kurtas
        </Link>
        <Link href="/category/electronics" className="text-slate-200 hover:text-white transition">
          Electronics & Audio
        </Link>
        <Link href="/category/home-kitchen" className="text-slate-200 hover:text-white transition">
          Home & Kitchen
        </Link>
        <Link href="/search?bestSeller=true" className="text-slate-200 hover:text-white transition">
          🔥 Best Sellers
        </Link>
        <Link href="/search?featured=true" className="text-slate-200 hover:text-white transition">
          ⚡ Today&apos;s Lightning Deals
        </Link>
      </nav>

      {/* Delivery Pincode Modal */}
      {showPincodeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Choose Delivery Location
              </h3>
              <button
                onClick={() => setShowPincodeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter your Indian delivery pincode to see accurate delivery speed, shipping availability, and local offers.
            </p>
            <form onSubmit={handlePincodeSubmit} className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6 digit pincode (e.g. 110001)"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={tempPincode.length !== 6}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold py-2 rounded-lg text-sm transition"
                >
                  Apply Pincode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
