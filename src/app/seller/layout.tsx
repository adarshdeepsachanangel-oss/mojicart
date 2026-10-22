"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  IndianRupee,
  PlusCircle,
  Store,
  ArrowLeft,
  Truck,
  Percent,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isPublicSellerPage =
    pathname === "/seller/fees" ||
    pathname === "/seller/shipping" ||
    pathname === "/seller/register";

  const dashboardNavLinks = [
    { href: "/seller", label: "Dashboard Overview", icon: LayoutDashboard },
    { href: "/seller/products", label: "Products Catalog", icon: Package },
    { href: "/seller/orders", label: "Fulfillment Orders", icon: ShoppingCart },
    { href: "/seller/finance", label: "Finance & Payouts", icon: IndianRupee },
  ];

  const publicNavLinks = [
    { href: "/seller", label: "Seller Dashboard", icon: LayoutDashboard },
    { href: "/seller/fees", label: "Lowest Commission Fees", icon: Percent },
    { href: "/seller/shipping", label: "Fulfillment by Mojicart", icon: Truck },
    { href: "/seller/register", label: "Start Selling Today", icon: UserPlus },
  ];

  const activeLinks = isPublicSellerPage ? publicNavLinks : dashboardNavLinks;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Seller Bar */}
      <div className="bg-[#232f3e] text-white border-b border-slate-700 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-semibold mr-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-sm text-white">Mojicart Seller Hub</span>
              <span className="text-[10px] text-amber-400 block -mt-0.5">
                {user?.sellerProfile?.storeName || "Direct Indian Vendor Portal"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {user?.role === "SELLER" ? (
            <Link
              href="/seller/products?new=true"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          ) : (
            <Link
              href="/seller/register"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Start Selling Today</span>
            </Link>
          )}

          {user && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-700">
              <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs">
                {user?.name?.[0] || "S"}
              </div>
              <span className="font-semibold text-slate-300">{user?.name || "Seller"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub Navigation Strip */}
      <div className="bg-white border-b border-slate-200 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto text-xs font-bold scrollbar-none">
          {activeLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
                  active
                    ? "border-amber-500 text-amber-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">{children}</div>
    </div>
  );
}
