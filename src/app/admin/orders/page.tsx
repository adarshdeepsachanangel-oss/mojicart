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
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Calendar,
  AlertCircle,
  ShieldCheck,
  User,
  Package,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Order Details Modal
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("CONFIRMED");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
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

  const openOrderModal = (ord: any) => {
    setActiveOrder(ord);
    setNewStatus(ord.orderStatus);
    setShippingCarrier(ord.shippingCarrier || "Delhivery Express");
    setTrackingNumber(ord.trackingNumber || "");
    setPaymentStatus(ord.paymentStatus || "PENDING");
    setEstimatedDeliveryDate(
      ord.estimatedDeliveryDate
        ? new Date(ord.estimatedDeliveryDate).toISOString().split("T")[0]
        : ""
    );
    setStatusComment("");
  };

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
          shippingCarrier,
          trackingNumber,
          paymentStatus,
          estimatedDeliveryDate: estimatedDeliveryDate || undefined,
          comment:
            statusComment ||
            `Status updated to ${newStatus} via ${shippingCarrier || "Courier Partner"}`,
        }),
      });

      if (res.ok) {
        setActiveOrder(null);
        await fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.orderStatus !== statusFilter) return false;

    let addr: any = {};
    try {
      if (o.deliveryAddress) addr = JSON.parse(o.deliveryAddress);
    } catch {}

    const searchTarget = [
      o.orderNumber,
      o.customer?.name,
      o.customer?.email,
      o.customer?.phone,
      addr.fullName,
      addr.phone,
      addr.email,
      addr.city,
      addr.state,
      addr.pincode,
      o.trackingNumber,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (search && !searchTarget.includes(search.toLowerCase())) return false;
    return true;
  });

  // Parse active order delivery address
  let activeAddress: any = null;
  if (activeOrder?.deliveryAddress) {
    try {
      activeAddress = JSON.parse(activeOrder.deliveryAddress);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Global Order Operations & Logistics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-vendor order state machine, customer address inspection, and dispatch tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Order ID, Name, Phone, City..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500 w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
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
                <th className="p-4">Customer & Contact</th>
                <th className="p-4">Shipping Destination</th>
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
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading global orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    No orders matching your search or status filter.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => {
                  let addr: any = {};
                  try {
                    if (ord.deliveryAddress) addr = JSON.parse(ord.deliveryAddress);
                  } catch {}

                  const customerName = addr.fullName || ord.customer?.name || "Customer";
                  const customerPhone = addr.phone || ord.customer?.phone || "No phone";
                  const customerEmail = addr.email || ord.customer?.email || "No email";
                  const destination = addr.city && addr.state ? `${addr.city}, ${addr.state} (${addr.pincode})` : "Standard Delivery";

                  return (
                    <tr key={ord.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-4">
                        <span className="font-mono font-bold text-white block">{ord.orderNumber}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-200 block">{customerName}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">📱 {customerPhone}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">✉️ {customerEmail}</span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-start gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">{destination}</span>
                            {addr.addressLine1 && (
                              <span className="text-[10px] text-slate-500 truncate block max-w-[160px]">
                                {addr.addressLine1}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-300 font-bold">
                        {ord.items?.length || 0} items
                      </td>

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
                              : ord.orderStatus === "SHIPPED"
                              ? "bg-purple-500/20 text-purple-300"
                              : ord.orderStatus === "PACKED"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                        {ord.trackingNumber && (
                          <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                            {ord.shippingCarrier ? `${ord.shippingCarrier}: ` : ""}#{ord.trackingNumber.slice(-8)}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => openOrderModal(ord)}
                          className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          Inspect / Transition
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

      {/* Inspect / Transition Comprehensive Modal */}
      {activeOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-black text-lg text-white">
                    {activeOrder.orderNumber}
                  </h3>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      activeOrder.orderStatus === "DELIVERED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : activeOrder.orderStatus === "CANCELLED"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {activeOrder.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {new Date(activeOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Details Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" /> Complete Customer & Shipping Details
                </span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">
                  {activeAddress?.addressType || "HOME"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Recipient Name</p>
                  <p className="font-bold text-white text-sm">
                    {activeAddress?.fullName || activeOrder.customer?.name || "Customer"}
                  </p>

                  <p className="text-[10px] text-slate-400 uppercase font-semibold mt-2">Mobile Phone</p>
                  <a
                    href={`tel:${activeAddress?.phone || activeOrder.customer?.phone}`}
                    className="font-bold text-amber-400 hover:underline flex items-center gap-1 font-mono text-xs"
                  >
                    <Phone className="w-3 h-3" /> {activeAddress?.phone || activeOrder.customer?.phone || "N/A"}
                  </a>

                  <p className="text-[10px] text-slate-400 uppercase font-semibold mt-2">Email Address</p>
                  <a
                    href={`mailto:${activeAddress?.email || activeOrder.customer?.email}`}
                    className="text-slate-300 hover:underline flex items-center gap-1 text-xs truncate"
                  >
                    <Mail className="w-3 h-3" /> {activeAddress?.email || activeOrder.customer?.email || "N/A"}
                  </a>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Delivery Address</p>
                  <p className="text-slate-300 mt-0.5 leading-relaxed font-medium">
                    {activeAddress?.addressLine1 || "Address provided during checkout"}
                    {activeAddress?.addressLine2 ? `, ${activeAddress.addressLine2}` : ""}
                    {activeAddress?.landmark ? ` (Near ${activeAddress.landmark})` : ""}
                  </p>
                  <p className="font-bold text-white mt-1">
                    {activeAddress?.city ? `${activeAddress.city}, ` : ""}
                    {activeAddress?.state ? `${activeAddress.state} - ` : ""}
                    <span className="text-amber-400 font-mono">{activeAddress?.pincode || ""}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Line items & Pricing */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-400" /> Order Items ({activeOrder.items?.length})
                </span>
                <span className="font-black text-amber-400 text-sm">
                  Total Payable: ₹{activeOrder.totalAmount.toFixed(0)}
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-800/50 pr-1">
                {activeOrder.items?.map((it: any) => (
                  <div key={it.id} className="pt-2 flex justify-between items-center text-xs gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{it.title}</p>
                      <p className="text-[11px] text-slate-400">
                        Qty: {it.quantity} × ₹{it.price.toFixed(0)} | Seller:{" "}
                        <span className="text-slate-300 font-semibold">{it.seller?.storeName || "Vendor"}</span>
                      </p>
                    </div>
                    <span className="font-bold text-white shrink-0">₹{it.total}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
                <span>Payment Mode: <strong className="text-white">{activeOrder.paymentMethod}</strong></span>
                <span>Payment Status: <strong className="text-white uppercase">{activeOrder.paymentStatus}</strong></span>
              </div>
            </div>

            {/* Transition & Logistics Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2 border-t border-slate-800 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" /> Logistics, State Transition & Live Customer Update
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Order Status State Machine:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="CONFIRMED">CONFIRMED (Order placed & verified)</option>
                    <option value="PROCESSING">PROCESSING (Assigned to warehouse/seller)</option>
                    <option value="PACKED">PACKED (Packed & ready for dispatch)</option>
                    <option value="SHIPPED">SHIPPED (In transit with courier)</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Out for delivery today)</option>
                    <option value="DELIVERED">DELIVERED (Successfully handed over to customer)</option>
                    <option value="CANCELLED">CANCELLED (Cancel order & restore stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Shipping Courier Partner:
                  </label>
                  <input
                    type="text"
                    list="couriers-list"
                    placeholder="e.g. Delhivery Express, Blue Dart"
                    value={shippingCarrier}
                    onChange={(e) => setShippingCarrier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-rose-500"
                  />
                  <datalist id="couriers-list">
                    <option value="Delhivery Express" />
                    <option value="Blue Dart" />
                    <option value="DTDC" />
                    <option value="Shadowfax" />
                    <option value="Ecom Express" />
                    <option value="India Post" />
                    <option value="Shiprocket" />
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Courier Tracking AWB Number:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DELH893410294"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Payment Status:
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="PENDING">PENDING (Awaiting Cash on Delivery)</option>
                    <option value="PAID">PAID (Payment collected & reconciled)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Customer Status Update Note (Shown on Customer&apos;s Order Tracking Timeline):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Package arrived at local delivery hub. Out for delivery with agent."
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Status History Audit Trail */}
              {activeOrder.statusHistory && activeOrder.statusHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                    Live Status History & Timeline ({activeOrder.statusHistory.length} events)
                  </p>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {activeOrder.statusHistory.map((hist: any) => (
                      <div
                        key={hist.id}
                        className="text-[11px] p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-slate-200">
                            {hist.fromStatus} → {hist.toStatus}
                          </span>
                          <p className="text-slate-400 mt-0.5">{hist.comment}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                          {new Date(hist.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 rounded-xl font-semibold text-slate-400 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-xl transition shadow-lg shadow-rose-950"
                >
                  {updating ? "Saving Update..." : "Apply & Notify Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
