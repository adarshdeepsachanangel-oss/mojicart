"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderQuery, setOrderQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedAWB, setCopiedAWB] = useState(false);

  const fetchOrder = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setOrderData(null);

    try {
      const res = await fetch(`/api/v1/orders/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrderData(data.order);
      } else {
        setErrorMsg(
          data.error || "Order not found. Please verify your order number (e.g. MOJI-2026-89410)."
        );
      }
    } catch {
      setErrorMsg("Failed to track order. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialQuery = searchParams.get("order") || searchParams.get("id");
    if (initialQuery) {
      setOrderQuery(initialQuery);
      fetchOrder(initialQuery);
    }
  }, [searchParams]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  const copyAWB = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  const steps = [
    { key: "CONFIRMED", label: "Order Confirmed" },
    { key: "PROCESSING", label: "Processing at Hub" },
    { key: "PACKED", label: "Packed & Labelled" },
    { key: "SHIPPED", label: "In Transit with Courier" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return 5;
      case "OUT_FOR_DELIVERY":
        return 4;
      case "SHIPPED":
        return 3;
      case "PACKED":
        return 2;
      case "PROCESSING":
        return 1;
      case "CONFIRMED":
      default:
        return 0;
    }
  };

  let addr: any = {};
  if (orderData?.deliveryAddress) {
    try {
      addr =
        typeof orderData.deliveryAddress === "string"
          ? JSON.parse(orderData.deliveryAddress)
          : orderData.deliveryAddress;
    } catch {}
  }

  const isCancelled = orderData?.orderStatus === "CANCELLED";
  const currentStepIdx = orderData ? getStepIndex(orderData.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs mb-3">
          <Truck className="w-3.5 h-3.5 text-amber-600" />
          <span>Real-Time Logistics Tracker</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Track Your Mojicart Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Enter your Order Number (e.g. MOJI-2026-89410) to see live courier dispatch, transit checkpoints, and estimated arrival.
        </p>

        {/* Input Form */}
        <form onSubmit={handleTrack} className="mt-6 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="e.g. MOJI-2026-89410"
              className="w-full uppercase font-mono font-bold text-xs sm:text-sm border border-slate-300 rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white shadow-2xs"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black px-7 py-3.5 rounded-xl text-xs sm:text-sm transition shrink-0 flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{loading ? "Searching..." : "Track Shipment"}</span>
          </button>
        </form>

        <div className="mt-3 text-left sm:text-center text-[11px] text-slate-400">
          Demo Order IDs to test:{" "}
          <button
            type="button"
            className="font-mono text-slate-700 font-bold hover:underline cursor-pointer"
            onClick={() => {
              setOrderQuery("MOJI-2026-89410");
              fetchOrder("MOJI-2026-89410");
            }}
          >
            MOJI-2026-89410
          </button>{" "}
          •{" "}
          <button
            type="button"
            className="font-mono text-slate-700 font-bold hover:underline cursor-pointer"
            onClick={() => {
              setOrderQuery("MOJI-2026-91204");
              fetchOrder("MOJI-2026-91204");
            }}
          >
            MOJI-2026-91204
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 max-w-xl mx-auto shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {orderData && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          {/* Order Header Summary */}
          <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Package className="w-4 h-4" />
                <span>Verified Shipment Details</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-mono font-black tracking-tight text-white">
                {orderData.orderNumber}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Placed on{" "}
                {new Date(orderData.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <span
                className={`text-xs font-black uppercase px-3.5 py-1.5 rounded-full tracking-wider ${
                  orderData.orderStatus === "DELIVERED"
                    ? "bg-emerald-500 text-slate-950"
                    : isCancelled
                    ? "bg-rose-500 text-white"
                    : "bg-amber-400 text-slate-950"
                }`}
              >
                {orderData.orderStatus.replace(/_/g, " ")}
              </span>

              {orderData.trackingNumber && (
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <span className="text-slate-400">{orderData.shippingCarrier || "Courier"}:</span>
                  <span className="font-bold text-amber-300">{orderData.trackingNumber}</span>
                  <button
                    onClick={() => copyAWB(orderData.trackingNumber)}
                    className="text-slate-400 hover:text-white transition"
                    title="Copy Tracking Number"
                  >
                    {copiedAWB ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Timeline (if not cancelled) */}
          {!isCancelled ? (
            <div className="px-6 py-8 sm:px-10 border-b border-slate-100 bg-slate-50/50">
              <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-200 -z-0">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${(Math.min(currentStepIdx, 5) / 5) * 100}%`,
                    }}
                  />
                </div>

                {steps.map((st, i) => {
                  const isPassed = i <= currentStepIdx;
                  const isCurrent = i === currentStepIdx;

                  return (
                    <div key={st.key} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                          isPassed
                            ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                            : "bg-white text-slate-400 border-2 border-slate-300"
                        } ${isCurrent ? "scale-110 ring-4 ring-emerald-200 animate-pulse" : ""}`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs mt-2 font-bold tracking-tight text-center max-w-[80px] leading-tight ${
                          isCurrent
                            ? "text-slate-950 font-black"
                            : isPassed
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {orderData.estimatedDeliveryDate && (
                <div className="mt-8 text-center text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>
                    Estimated Delivery:{" "}
                    <strong className="text-slate-900">
                      {new Date(orderData.estimatedDeliveryDate).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-center gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">This order has been cancelled.</p>
                <p className="text-[11px] text-rose-600">
                  {orderData.statusHistory?.[0]?.comment || "Cancelled by customer / admin."}
                </p>
              </div>
            </div>
          )}

          {/* 2-Column Details: Shipping Destination & Audit Timeline */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100">
            {/* Destination */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-3">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Delivery Address</span>
              </div>

              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  {addr.fullName || orderData.customer?.name || "Customer"}
                </p>
                <p className="font-medium text-slate-700">
                  {addr.addressLine1 || "Standard delivery destination"}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                {addr.landmark && (
                  <p className="text-slate-500 text-[11px]">Landmark: {addr.landmark}</p>
                )}
                <p className="font-bold text-slate-900">
                  {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ") || "India"}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {orderData.paymentMethod || "COD"} ({orderData.paymentStatus || "PENDING"})
                  </span>
                </div>
              </div>
            </div>

            {/* Status Timeline History */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Status Update History</span>
              </div>

              {orderData.statusHistory && orderData.statusHistory.length > 0 ? (
                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200">
                  {orderData.statusHistory.map((h: any, i: number) => (
                    <div key={h.id || i} className="relative">
                      <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                      <div className="flex items-center justify-between text-[11px] gap-2">
                        <span className="font-bold text-slate-900 uppercase">
                          {h.toStatus.replace(/_/g, " ")}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(h.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {h.comment && (
                        <p className="text-slate-600 text-[11px] mt-1 bg-white p-2 rounded-lg border border-slate-200/80">
                          {h.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">
                  Order confirmed. Check back soon for courier transit checkpoints.
                </p>
              )}
            </div>
          </div>

          {/* Ordered Line Items */}
          <div className="p-6 sm:p-8">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-4 flex items-center justify-between">
              <span>Ordered Package Items ({orderData.items?.length || 0})</span>
              <span className="font-black text-slate-900 text-sm">
                Total: ₹{orderData.totalAmount?.toFixed(0)}
              </span>
            </h3>

            <div className="divide-y divide-slate-100">
              {orderData.items?.map((it: any) => (
                <div key={it.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    {it.product?.images && it.product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.product.images[0].url}
                        alt={it.title}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{it.title}</p>
                      <p className="text-slate-400 text-[11px]">
                        Qty: {it.quantity} × ₹{it.price.toFixed(0)}
                        {it.seller?.storeName && ` • Sold by ${it.seller.storeName}`}
                      </p>
                    </div>
                  </div>

                  <span className="font-black text-slate-900 text-sm shrink-0">
                    ₹{it.total.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-slate-500 font-bold">
          Loading order tracking...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
