"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle,
} from "lucide-react";

export default function SellerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/seller/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-slate-500">
        Loading seller metrics and orders...
      </div>
    );
  }

  const metrics = data?.metrics || {
    grossSales: 0,
    totalCommissions: 0,
    netEarnings: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            Seller Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Welcome, {data?.seller?.storeName || "Vendor"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store Status:{" "}
            <span className="font-bold text-emerald-600 uppercase">
              {data?.seller?.status || "APPROVED"}
            </span>{" "}
            | Marketplace Commission Rate:{" "}
            <span className="font-bold text-slate-900">{data?.seller?.commissionRate || 10}%</span>
          </p>
        </div>

        <Link
          href="/seller/products?new=true"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Gross Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            ₹{metrics.grossSales.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Total value of all items sold</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Net Seller Payout</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            ₹{metrics.netEarnings.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            After {data?.seller?.commissionRate || 10}% platform commission
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Dispatch</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            {metrics.pendingOrders} Orders
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            Ready to pack and ship
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Listings</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            {metrics.totalProducts} Items
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.completedOrders} orders delivered
          </p>
        </div>
      </div>

      {/* Grid: Low Stock Warnings & Recent Suborders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Orders Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-500" />
              <span>Recent Suborder Items</span>
            </h3>
            <Link
              href="/seller/orders"
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recentItems?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No order items yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data?.recentItems?.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-slate-400 text-[11px]">
                      Order: <span className="font-mono font-semibold">{item.order?.orderNumber}</span> | Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block">
                      ₹{item.total.toFixed(0)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Low Stock Alert (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Low Stock Alerts (&le; 15 units)</span>
            </h3>
            <Link
              href="/seller/products"
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              Manage
            </Link>
          </div>

          {data?.lowStockProducts?.length === 0 ? (
            <div className="p-6 text-center text-xs text-emerald-600 font-bold flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>All catalog inventory levels are healthy!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.lowStockProducts?.map((prod: any) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">{prod.title}</p>
                    <p className="text-slate-400 text-[10px] font-mono">SKU: {prod.sku}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-rose-100 text-rose-800 font-black text-xs shrink-0">
                    {prod.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
