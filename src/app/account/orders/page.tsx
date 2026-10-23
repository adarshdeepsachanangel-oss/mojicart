"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
  Printer,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CustomerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedAWB, setCopiedAWB] = useState<string | null>(null);

  // Cancel order modal state
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const fetchOrders = () => {
    fetch("/api/v1/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAWB(id);
    setTimeout(() => setCopiedAWB(null), 2000);
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    setCancelSubmitting(true);
    setCancelError("");

    try {
      const res = await fetch(`/api/v1/orders/${cancellingOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          comment: cancelReason.trim()
            ? `Customer cancellation reason: ${cancelReason.trim()}`
            : "Cancelled by customer via orders portal",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      setCancellingOrder(null);
      setCancelReason("");
      fetchOrders();
    } catch (err: any) {
      setCancelError(err.message || "Failed to cancel order");
    } finally {
      setCancelSubmitting(false);
    }
  };

  const steps = [
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "PROCESSING", label: "Processing" },
    { key: "PACKED", label: "Packed" },
    { key: "SHIPPED", label: "Shipped" },
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "OUT_FOR_DELIVERY":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "PACKED":
      case "PROCESSING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "CONFIRMED":
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "ACTIVE") {
        if (order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED") return false;
      } else if (order.orderStatus !== statusFilter) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber?.toLowerCase().includes(q);
      const matchItem = order.items?.some((it: any) => it.title?.toLowerCase().includes(q));
      return matchNumber || matchItem;
    }

    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-bold text-sm">Loading your orders & shipments...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4 shadow-inner">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Please Sign In</h2>
        <p className="text-xs text-slate-500 mb-6">
          Sign in to view your real-time order tracking, live courier updates, and delivery addresses.
        </p>
        <Link
          href="/login?redirect=/account/orders"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition shadow-md"
        >
          Sign In to Mojicart
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-amber-600 transition">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>My Orders & Shipments</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              {orders.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track live dispatch, view delivery details, and inspect courier timeline updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/track-order"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Public Courier Tracker</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      {orders.length > 0 && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or item title..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            {["ALL", "ACTIVE", "DELIVERED", "CANCELLED"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  statusFilter === f
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {f === "ALL" ? "All Orders" : f === "ACTIVE" ? "In Transit / Active" : f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4">
            <Package className="w-10 h-10" />
          </div>
          <h3 className="font-black text-xl text-slate-900 mb-1">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Looks like you haven&apos;t placed any orders with this account yet. Discover trending deals and get lightning-fast delivery!
          </p>
          <Link
            href="/"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-7 py-3 rounded-xl text-xs transition shadow-md"
          >
            Start Shopping Now
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No orders match your search criteria. Try a different query or filter.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            let addr: any = {};
            try {
              if (order.deliveryAddress) {
                addr = typeof order.deliveryAddress === "string" ? JSON.parse(order.deliveryAddress) : order.deliveryAddress;
              }
            } catch {}

            const isCancelled = order.orderStatus === "CANCELLED";
            const isDelivered = order.orderStatus === "DELIVERED";
            const currentStepIdx = getStepIndex(order.orderStatus);
            const isExpanded = expandedOrderId === order.id;
            const canCancel = ["CONFIRMED", "PROCESSING"].includes(order.orderStatus);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header Bar */}
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Order ID
                      </span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-slate-200" />

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Placed On
                      </span>
                      <span className="font-bold text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-slate-200" />

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Total Amount
                      </span>
                      <span className="font-black text-slate-900 text-sm">
                        ₹{order.totalAmount.toFixed(0)}
                      </span>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-slate-200" />

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Payment Mode
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        {order.paymentMethod || "COD"}
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                            order.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.paymentStatus || "PENDING"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper (if not cancelled) */}
                {!isCancelled ? (
                  <div className="px-5 py-6 bg-gradient-to-b from-slate-50/50 to-white border-b border-slate-100">
                    <div className="max-w-3xl mx-auto">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-200 -z-0">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: `${(Math.min(currentStepIdx, 5) / 5) * 100}%`,
                            }}
                          />
                        </div>

                        {steps.map((st, idx) => {
                          const isPassed = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={st.key} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                                  isPassed
                                    ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                                    : "bg-white text-slate-400 border-2 border-slate-300"
                                } ${isCurrent ? "scale-110 ring-4 ring-emerald-200 animate-pulse" : ""}`}
                              >
                                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[10px] sm:text-[11px] mt-1.5 font-bold tracking-tight text-center max-w-[70px] leading-tight ${
                                  isCurrent
                                    ? "text-slate-900 font-black"
                                    : isPassed
                                    ? "text-slate-700"
                                    : "text-slate-400"
                                }`}
                              >
                                {st.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Estimated Delivery / Courier Strip */}
                      <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-amber-500" />
                          {isDelivered ? (
                            <span className="font-bold text-emerald-700">
                              Package successfully delivered!
                            </span>
                          ) : order.estimatedDeliveryDate ? (
                            <span className="font-medium text-slate-700">
                              Estimated Delivery:{" "}
                              <strong className="text-slate-900">
                                {new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </strong>
                            </span>
                          ) : (
                            <span className="font-medium text-slate-600">
                              Delivery partner assignment in progress
                            </span>
                          )}
                        </div>

                        {order.trackingNumber && (
                          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">
                            <span className="text-[11px] text-slate-500 font-medium">
                              {order.shippingCarrier || "Courier"}:
                            </span>
                            <span className="font-mono font-bold text-slate-800 text-[11px]">
                              {order.trackingNumber}
                            </span>
                            <button
                              onClick={() => copyToClipboard(order.trackingNumber, order.id)}
                              className="text-slate-400 hover:text-slate-700 transition"
                              title="Copy Tracking Number"
                            >
                              {copiedAWB === order.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4 bg-rose-50/70 border-b border-rose-100 flex items-center gap-3 text-rose-800 text-xs">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <p className="font-bold">This order has been cancelled.</p>
                      <p className="text-[11px] text-rose-700">
                        {order.statusHistory?.[0]?.comment || "Cancelled upon customer request. No amount will be collected."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Ordered Items List */}
                <div className="p-5">
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          {item.product?.images && item.product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product.images[0].url}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/product/${item.product?.slug || item.productId}`}
                              className="font-bold text-xs sm:text-sm text-slate-900 hover:text-amber-600 transition line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Qty: <span className="font-semibold text-slate-700">{item.quantity}</span> × ₹
                              {item.price.toFixed(0)}
                            </p>
                            {item.seller?.storeName && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Sold by: <span className="font-medium text-slate-600">{item.seller.storeName}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-black text-sm text-slate-900">
                            ₹{item.total.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Toggle Detailed Information */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="text-xs font-bold text-slate-700 hover:text-amber-600 transition flex items-center gap-1.5"
                    >
                      <span>{isExpanded ? "Hide Full Order & Shipping Details" : "View Shipping Address & Timeline"}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Track Order Page</span>
                      </Link>

                      {canCancel && (
                        <button
                          onClick={() => {
                            setCancellingOrder(order);
                            setCancelReason("");
                            setCancelError("");
                          }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition border border-rose-200"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Accordion: Full Shipping Details & Timeline */}
                  {isExpanded && (
                    <div className="mt-4 p-4 sm:p-5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-5 animate-in fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Customer & Shipping Details */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                          <div className="flex items-center gap-2 text-slate-800 font-bold mb-3 pb-2 border-b border-slate-100">
                            <MapPin className="w-4 h-4 text-amber-500" />
                            <span>Delivery Destination & Contact</span>
                          </div>

                          <div className="space-y-1.5 text-slate-700 leading-relaxed">
                            <p className="font-bold text-slate-900 text-sm">
                              {addr.fullName || order.customer?.name || user.name}
                            </p>
                            {(addr.phone || order.customer?.phone) && (
                              <p className="flex items-center gap-1.5 text-slate-600">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{addr.phone || order.customer?.phone}</span>
                              </p>
                            )}
                            {(addr.email || order.customer?.email) && (
                              <p className="flex items-center gap-1.5 text-slate-600">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>{addr.email || order.customer?.email}</span>
                              </p>
                            )}
                            <div className="mt-2 pt-2 border-t border-slate-100">
                              <p className="font-medium text-slate-800">
                                {addr.addressLine1 || "Standard Delivery"}
                                {addr.addressLine2 && `, ${addr.addressLine2}`}
                              </p>
                              {addr.landmark && (
                                <p className="text-slate-500 text-[11px]">Landmark: {addr.landmark}</p>
                              )}
                              <p className="font-bold text-slate-800">
                                {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ") ||
                                  "India"}
                              </p>
                              {addr.addressType && (
                                <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                  {addr.addressType} Address
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Status History Audit */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                          <div className="flex items-center gap-2 text-slate-800 font-bold mb-3 pb-2 border-b border-slate-100">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>Shipment Timeline & Logistics Updates</span>
                          </div>

                          {order.statusHistory && order.statusHistory.length > 0 ? (
                            <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200">
                              {order.statusHistory.map((h: any, i: number) => (
                                <div key={h.id || i} className="relative">
                                  <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                                  <div className="flex items-center justify-between text-[11px] gap-2">
                                    <span className="font-bold text-slate-900 uppercase">
                                      {h.toStatus.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-slate-400 text-[10px]">
                                      {new Date(h.createdAt).toLocaleString("en-IN", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  {h.comment && (
                                    <p className="text-slate-600 text-[11px] mt-0.5 bg-slate-50 p-2 rounded border border-slate-100">
                                      {h.comment}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 text-xs italic">
                              Order is confirmed. Live courier tracking logs will appear as soon as the parcel is dispatched.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>Cancel Order {cancellingOrder.orderNumber}</span>
              </div>
              <button
                onClick={() => setCancellingOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Are you sure you want to cancel this order? Once cancelled, the seller will stop fulfillment and reserved inventory will be released.
            </p>

            {cancelError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
                {cancelError}
              </div>
            )}

            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed my mind, found another product, ordered by mistake..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                disabled={cancelSubmitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {cancelSubmitting ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
