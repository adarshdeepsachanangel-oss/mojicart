"use client";

import React, { useEffect, useState } from "react";
import { IndianRupee, Download, Building, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SellerFinancePage() {
  const { user } = useAuth();
  const [finance, setFinance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/seller/finance")
      .then((res) => res.json())
      .then((data) => setFinance(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="py-20 text-center text-sm font-semibold text-slate-500">Loading financials...</div>;
  }

  const summary = finance?.summary || {
    totalGross: 0,
    totalCommission: 0,
    totalPayoutsReceived: 0,
    pendingBalance: 0,
    commissionRate: 10,
    bankDetails: {},
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Financial Settlements & Payouts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated bank transfers, gross merchandise value, commission deductions & tax statements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Gross Sales</span>
          <p className="text-2xl font-black text-slate-900 mt-2">
            ₹{summary.totalGross.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Total revenue generated</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500">
            Marketplace Commission ({summary.commissionRate}%)
          </span>
          <p className="text-2xl font-black text-rose-600 mt-2">
            ₹{summary.totalCommission.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Platform fee deducted</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Total Payouts Settled</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            ₹{summary.totalPayoutsReceived.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Credited to registered bank account</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Current Pending Balance</span>
          <p className="text-2xl font-black text-amber-600 mt-2">
            ₹{summary.pendingBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Scheduled for next cycle</p>
        </div>
      </div>

      {/* Bank Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">
              Registered Settlement Account: {summary.bankDetails?.bankName || "HDFC Bank"}
            </p>
            <p className="text-slate-500">
              Account: {summary.bankDetails?.accountNumber || "••••7890"} | IFSC:{" "}
              {summary.bankDetails?.ifsc || "HDFC0000123"}
            </p>
          </div>
        </div>
        <span className="text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-[10px] uppercase">
          Verified Active
        </span>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Settlement Transfer History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="p-4">Settlement ID</th>
                <th className="p-4">Period</th>
                <th className="p-4">Gross Sales</th>
                <th className="p-4">Commission</th>
                <th className="p-4">Net Payout</th>
                <th className="p-4">Status</th>
                <th className="p-4">Bank Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {finance?.settlements?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No past settlements yet.
                  </td>
                </tr>
              ) : (
                finance?.settlements?.map((settle: any) => (
                  <tr key={settle.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {settle.settlementNumber}
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(settle.periodStart).toLocaleDateString()} -{" "}
                      {new Date(settle.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      ₹{settle.grossSales.toFixed(0)}
                    </td>
                    <td className="p-4 text-rose-600 font-semibold">
                      -₹{settle.totalCommission.toFixed(0)}
                    </td>
                    <td className="p-4 font-black text-emerald-600 text-sm">
                      ₹{settle.netPayout.toFixed(0)}
                    </td>
                    <td className="p-4">
                      <span className="inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {settle.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      {settle.bankReference || "NEFT-PROCESSED"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
