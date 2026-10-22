"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Package, Truck, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setOrderData(null);

    try {
      const res = await fetch(`/api/v1/orders/${encodeURIComponent(orderQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrderData(data.order);
      } else {
        setErrorMsg("Order not found. Please verify your order number (e.g. MOJI-2026-89410).");
      }
    } catch {
      setErrorMsg("Failed to track order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: "CONFIRMED", label: "Order Confirmed" },
    { key: "PACKED", label: "Packed at Seller Hub" },
    { key: "SHIPPED", label: "In Transit with Courier" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const getStepIndex = (status: string) => {
    if (status === "DELIVERED") return 4;
    if (status === "OUT_FOR_DELIVERY") return 3;
    if (status === "SHIPPED") return 2;
    if (status === "PACKED") return 1;
    return 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Track Your Mojicart Order
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your Order Number or Tracking AWB to see real-time dispatch updates
        </p>

        <form onSubmit={handleTrack} className="mt-5 flex gap-2">
          <input
            type="text"
            required
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="e.g. MOJI-2026-89410"
            className="w-full uppercase font-mono font-semibold text-xs border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition shrink-0 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? "Searching..." : "Track"}</span>
          </button>
        </form>

        <div className="mt-2 text-left text-[11px] text-slate-400">
          Tip: Seeded demo order IDs: <span className="font-mono text-slate-700 font-bold cursor-pointer underline" onClick={() => setOrderQuery("MOJI-2026-89410")}>MOJI-2026-89410</span> or <span className="font-mono text-slate-700 font-bold cursor-pointer underline" onClick={() => setOrderQuery("MOJI-2026-91204")}>MOJI-2026-91204</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {orderData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-in fade-in">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Order Tracking
              </span>
              <h2 className="text-xl font-mono font-black text-slate-900 mt-0.5">
                {orderData.orderNumber}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(orderData.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Status: {orderData.orderStatus}
              </span>
              {orderData.trackingNumber && (
                <p className="text-xs font-mono text-slate-500 mt-2">
                  Carrier: {orderData.shippingCarrier || "Delhivery"} | AWB:{" "}
                  <span className="font-bold text-slate-800">{orderData.trackingNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="py-8 border-b border-slate-100">
            <div className="grid grid-cols-5 gap-2 text-center">
              {steps.map((st, i) => {
                const currentIdx = getStepIndex(orderData.orderStatus);
                const isPassed = i <= currentIdx;
                const isCurrent = i === currentIdx;

                return (
                  <div key={st.key} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition shadow-sm ${
                        isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span
                      className={`text-[11px] leading-tight font-bold ${
                        isCurrent ? "text-slate-950 font-black" : isPassed ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Line Items */}
          <div className="pt-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
              Shipment Contents ({orderData.items?.length} items)
            </h3>
            <div className="divide-y divide-slate-100">
              {orderData.items?.map((it: any) => (
                <div key={it.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{it.title}</p>
                    <p className="text-slate-400 text-[11px]">
                      Quantity: {it.quantity} | Unit Price: ₹{it.price.toFixed(0)}
                    </p>
                  </div>
                  <span className="font-black text-slate-900 text-sm">₹{it.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
