"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Store,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-slate-400">
        Loading real-time executive marketplace analytics...
      </div>
    );
  }

  const m = data?.metrics || {
    gmv: 0,
    netSales: 0,
    totalPlatformCommission: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
    activeSellers: 0,
    pendingSellers: 0,
    totalProducts: 0,
    pendingProducts: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
            Super Admin Control Center
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Marketplace Executive Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-vendor metrics, GMV, settlements, and catalog operations
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/cms"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Homepage CMS</span>
          </Link>
          <Link
            href="/admin/products"
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <span>Moderate Products ({m.pendingProducts})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Gross Merchandise Value (GMV)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">₹{m.gmv.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">Total customer transaction volume</p>
        </div>

        {/* Platform Revenue */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Marketplace Commission Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-3">
            ₹{m.totalPlatformCommission.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Net platform earnings from vendor fees</p>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Marketplace Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{m.totalOrders}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {m.completedOrders} Delivered | {m.pendingOrders} Active
          </p>
        </div>

        {/* Vendors */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Multi-Vendor Network</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{m.activeSellers} Active</p>
          <p className="text-[11px] text-amber-400 font-bold mt-1">
            {m.pendingSellers} Vendor KYC Awaiting Approval
          </p>
        </div>
      </div>

      {/* Grid: Recent Global Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-rose-500" />
              <span>Recent Marketplace Orders</span>
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-rose-400 hover:underline flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {data?.recentOrders?.map((ord: any) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{ord.orderNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full uppercase bg-slate-800 text-slate-300">
                      {ord.paymentMethod}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Customer: <span className="text-slate-200">{ord.customer?.name}</span> | Items:{" "}
                    {ord.items?.length}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-black text-white block">
                    ₹{ord.totalAmount.toFixed(0)}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ord.orderStatus === "DELIVERED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : ord.orderStatus === "CANCELLED"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {ord.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock & Seller Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Low Stock */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Low Stock Inventory Alerts</span>
              </h3>
              <Link href="/admin/products" className="text-xs font-bold text-rose-400 hover:underline">
                View
              </Link>
            </div>

            <div className="space-y-2">
              {data?.lowStockProducts?.map((p: any) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-200 truncate">{p.title}</p>
                    <p className="text-[10px] font-mono text-slate-500">SKU: {p.sku}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-black text-xs shrink-0">
                    {p.stock} units
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-white mb-3">Quick Operational Actions</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/admin/sellers"
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-200 transition"
              >
                Approve Sellers ({m.pendingSellers})
              </Link>
              <Link
                href="/admin/products"
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-200 transition"
              >
                Catalog Moderation
              </Link>
              <Link
                href="/admin/cms"
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-200 transition"
              >
                Manage Homepage Rails
              </Link>
              <Link
                href="/admin/settings"
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-200 transition"
              >
                Global Commission Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
