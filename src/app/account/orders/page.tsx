"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Truck, Calendar, ChevronRight, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CustomerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch("/api/v1/orders")
        .then((res) => res.json())
        .then((data) => setOrders(data.orders || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500 font-semibold text-sm">
        Loading your order history...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Please sign in to view orders</h2>
        <Link
          href="/login"
          className="inline-block bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">My Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track, cancel, or reorder items</p>
        </div>
        <Link href="/" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-800 mb-1">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 mb-5">
            Looks like you haven&apos;t ordered any items yet. Start exploring our deals!
          </p>
          <Link
            href="/"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition"
          >
            Explore Best Sellers
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            let addr = { fullName: "", city: "", state: "", pincode: "" };
            try {
              if (order.deliveryAddress) addr = JSON.parse(order.deliveryAddress);
            } catch {}

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap gap-4 sm:gap-8">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[10px]">Order Placed</p>
                      <p className="font-bold text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[10px]">Total Amount</p>
                      <p className="font-bold text-slate-900">₹{order.totalAmount.toFixed(0)}</p>
                    </div>

                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[10px]">Ship To</p>
                      <p className="font-bold text-slate-800 truncate max-w-[120px]">
                        {addr.fullName || user.name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 font-semibold uppercase text-[10px] text-right">
                      Order ID
                    </p>
                    <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
                  </div>
                </div>

                {/* Status Strip & Items */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          order.orderStatus === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.orderStatus === "CANCELLED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      {order.estimatedDeliveryDate && order.orderStatus !== "DELIVERED" && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          Est. Delivery:{" "}
                          {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {order.trackingNumber && (
                      <span className="text-xs text-slate-500 font-mono">
                        AWB: {order.trackingNumber}
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.product?.images && item.product.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product.images[0].url}
                              alt={item.title}
                              className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/product/${item.product?.slug || item.productId}`}
                              className="font-bold text-xs sm:text-sm text-slate-900 hover:text-amber-600 line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <p className="text-xs text-slate-400">
                              Qty: {item.quantity} × ₹{item.price.toFixed(0)} | Seller:{" "}
                              {item.seller?.storeName}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-black text-xs sm:text-sm text-slate-900">
                            ₹{item.total.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
