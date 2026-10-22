"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  X,
  FileText,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Order Details Modal
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("DELIVERED");
  const [statusComment, setStatusComment] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/v1/orders?limit=100");
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
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/v1/orders/${activeOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          comment: statusComment || `Status advanced to ${newStatus} by Super Admin`,
        }),
      });

      if (res.ok) {
        setActiveOrder(null);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.orderStatus !== statusFilter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customer?.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Global Order Operations & Logistics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-vendor order state machine, shipment tracking, and cancellation overrides
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search Order ID or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items Count</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading global orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    No orders matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-4">
                      <span className="font-mono font-bold text-white block">{ord.orderNumber}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-200 block">{ord.customer?.name}</span>
                      <span className="text-[11px] text-slate-500">{ord.customer?.email}</span>
                    </td>

                    <td className="p-4 text-slate-300 font-bold">{ord.items?.length} items</td>

                    <td className="p-4 font-black text-white text-sm">
                      ₹{ord.totalAmount.toFixed(0)}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-300 block">{ord.paymentMethod}</span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          ord.paymentStatus === "PAID" ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          ord.orderStatus === "DELIVERED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : ord.orderStatus === "CANCELLED"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setActiveOrder(ord);
                          setNewStatus(ord.orderStatus);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                      >
                        Inspect / Transition
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect / Transition Modal */}
      {activeOrder && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-base text-white">
                  Order Details: {activeOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Customer: {activeOrder.customer?.name} ({activeOrder.customer?.phone})
                </p>
              </div>
              <button onClick={() => setActiveOrder(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Line items */}
            <div className="mb-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Order Items & Multi-Vendor Breakdown
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeOrder.items?.map((it: any) => (
                  <div
                    key={it.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{it.title}</p>
                      <p className="text-[11px] text-slate-400">
                        Qty: {it.quantity} | Seller: {it.seller?.storeName} | Payout: ₹{it.sellerPayout}
                      </p>
                    </div>
                    <span className="font-black text-white">₹{it.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transition Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Force Advance Order Status State Machine:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-semibold focus:ring-1 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED (Advance to completed)</option>
                  <option value="CANCELLED">CANCELLED (Restores inventory)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Admin Audit Reason / Note:</label>
                <input
                  type="text"
                  placeholder="e.g. Manually verified dispatch with logistics partner"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 border border-slate-800 rounded-lg font-semibold text-slate-400"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2 rounded-lg transition"
                >
                  {updating ? "Saving..." : "Apply Status Transition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
