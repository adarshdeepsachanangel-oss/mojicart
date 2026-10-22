"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Percent,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function SellerFeesPage() {
  const [sellingPrice, setSellingPrice] = useState(499);

  const commissionRate = 0.1; // 10%
  const commission = Math.round(sellingPrice * commissionRate);
  const gstOnFee = Math.round(commission * 0.18); // 18% GST on platform services
  const netSellerPayout = Math.max(0, sellingPrice - commission - gstOnFee);

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5">
          <Percent className="w-3.5 h-3.5 text-amber-600" />
          Industry-Lowest Fees
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight leading-tight">
          Keep More of What You Earn
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          While traditional marketplaces charge up to 35% in commissions, listing fees, and closing penalties, Mojicart operates on a transparent, flat 10% platform fee.
        </p>
      </div>

      {/* 4 Highlights Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
          <p className="text-3xl sm:text-4xl font-black text-amber-600">10%</p>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">Flat Commission</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all major product categories</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
          <p className="text-3xl sm:text-4xl font-black text-emerald-600">₹0</p>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">Listing Fees</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Upload unlimited products for free</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
          <p className="text-3xl sm:text-4xl font-black text-blue-600">₹0</p>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">Monthly Subscription</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Pay only when an item is ordered</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
          <p className="text-3xl sm:text-4xl font-black text-purple-600">7 Days</p>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">Fast Payouts</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Automated direct bank settlements</p>
        </div>
      </div>

      {/* Interactive Seller Profit Calculator */}
      <div className="bg-gradient-to-br from-slate-900 to-[#1e293b] rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black text-white">
              Instant Seller Payout Calculator
            </h2>
          </div>
          <p className="text-xs text-slate-300 mb-6">
            Enter your product selling price to see exactly how much money lands in your bank account.
          </p>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-6">
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Your Product Selling Price (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min={50}
                max={100000}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-3 bg-slate-900 text-white font-bold text-lg rounded-xl border border-slate-600 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="mt-6 space-y-3 pt-4 border-t border-slate-700/80 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Mojicart Platform Fee (10%):</span>
                <span className="font-bold text-rose-400">- ₹{commission}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Govt. GST on Platform Fee (18% of fee):</span>
                <span>- ₹{gstOnFee}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Fixed Closing Fees:</span>
                <span className="font-bold text-emerald-400">₹0 (Free)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Payment Gateway Surcharges:</span>
                <span className="font-bold text-emerald-400">₹0 (Absorbed by Mojicart)</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-600 flex justify-between items-center text-sm sm:text-base">
                <span className="font-black text-amber-400">Your Net Weekly Bank Payout:</span>
                <span className="font-black text-2xl text-emerald-400">₹{netSellerPayout}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/seller/register"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm transition shadow-lg"
            >
              <span>Start Selling at 10% Commission</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
          Mojicart vs Traditional Indian Marketplaces
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Clear comparison of platform deduction policies
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400">
                <th className="py-3 px-4 font-bold">Fee Parameter</th>
                <th className="py-3 px-4 font-bold text-amber-600">Mojicart</th>
                <th className="py-3 px-4 font-bold">Traditional Platforms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800">Marketplace Commission</td>
                <td className="py-3 px-4 font-black text-emerald-600">Flat 10%</td>
                <td className="py-3 px-4 text-slate-500">22% - 35% variable</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800">Product Listing Fee</td>
                <td className="py-3 px-4 font-bold text-emerald-600">₹0 (Always Free)</td>
                <td className="py-3 px-4 text-slate-500">₹5 - ₹25 per SKU</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800">Fixed Closing Fee</td>
                <td className="py-3 px-4 font-bold text-emerald-600">₹0</td>
                <td className="py-3 px-4 text-slate-500">₹15 - ₹50 per order</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800">Weekly Payout Cycle</td>
                <td className="py-3 px-4 font-bold text-slate-900">7 Days Direct Bank Transfer</td>
                <td className="py-3 px-4 text-slate-500">14 to 30 Days</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800">Catalog AI Ingestion</td>
                <td className="py-3 px-4 font-bold text-emerald-600">Included Free</td>
                <td className="py-3 px-4 text-slate-500">Manual / Paid Agencies</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
