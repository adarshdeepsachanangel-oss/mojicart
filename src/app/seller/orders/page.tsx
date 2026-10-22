"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("PACKED");
  const [carrier, setCarrier] = useState("Delhivery Express");
  const [trackingNo, setTrackingNo] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/v1/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/v1/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          shippingCarrier: carrier,
          trackingNumber: trackingNo || selectedOrder.trackingNumber,
        }),
      });

      if (res.ok) {
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Fulfillment & Shipping Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process new customer orders, print packing slips, and confirm courier dispatch
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer & City</th>
                <th className="p-4">Items Ordered</th>
                <th className="p-4">Seller Payout</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading your fulfillment queue...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No orders in your fulfillment queue.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  let addr = { fullName: "", city: "", state: "", pincode: "" };
                  try {
                    if (o.deliveryAddress) addr = JSON.parse(o.deliveryAddress);
                  } catch {}

                  const sellerItemsTotal = o.items.reduce((sum: number, it: any) => sum + it.sellerPayout, 0);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {o.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{addr.fullName || o.customer?.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {addr.city}, {addr.pincode}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          {o.items.map((it: any) => (
                            <p key={it.id} className="text-[11px] text-slate-700 font-medium">
                              {it.quantity}x {it.title}
                            </p>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 font-black text-slate-900">
                        ₹{sellerItemsTotal.toFixed(0)}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-700">{o.paymentMethod}</span>
                        <span
                          className={`block text-[10px] font-bold uppercase ${
                            o.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            o.orderStatus === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : o.orderStatus === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : o.orderStatus === "PACKED"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setNewStatus(
                              o.orderStatus === "CONFIRMED"
                                ? "PACKED"
                                : o.orderStatus === "PACKED"
                                ? "SHIPPED"
                                : "DELIVERED"
                            );
                            setTrackingNo(o.trackingNumber || "");
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                Update Fulfillment Status: {selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="PACKED">PACKED (Labeled & Boxed)</option>
                  <option value="SHIPPED">SHIPPED (Handed over to courier)</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED (Customer received OTP)</option>
                </select>
              </div>

              {newStatus === "SHIPPED" && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Courier Carrier</label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="e.g. Delhivery, BlueDart, Ecom Express"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tracking / AWB Number
                    </label>
                    <input
                      type="text"
                      value={trackingNo}
                      onChange={(e) => setTrackingNo(e.target.value)}
                      placeholder="e.g. DELH984719284"
                      className="w-full font-mono uppercase border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2 rounded-lg transition"
                >
                  {updating ? "Saving..." : "Confirm Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
