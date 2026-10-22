"use client";

import React, { useEffect, useState } from "react";
import {
  Store,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Check,
  X,
  Edit2,
  Percent,
} from "lucide-react";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Commission Modal
  const [editingSeller, setEditingSeller] = useState<any>(null);
  const [customCommission, setCustomCommission] = useState("10.0");
  const [updating, setUpdating] = useState(false);

  const fetchSellers = async () => {
    try {
      const res = await fetch("/api/v1/admin/sellers");
      if (res.ok) {
        const data = await res.json();
        setSellers(data.sellers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleUpdateStatus = async (sellerId: string, status: string) => {
    try {
      const res = await fetch("/api/v1/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, status }),
      });
      if (res.ok) fetchSellers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeller) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/v1/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: editingSeller.id, commissionRate: customCommission }),
      });
      if (res.ok) {
        setEditingSeller(null);
        fetchSellers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Multi-Vendor Seller Directory & KYC Audit
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Approve onboarding applications, verify GSTIN/Bank details, and manage platform commission rates
        </p>
      </div>

      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="p-4">Store Name & Owner</th>
                <th className="p-4">Tax KYC (GSTIN / PAN)</th>
                <th className="p-4">Bank Account</th>
                <th className="p-4">Commission %</th>
                <th className="p-4">Listings</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">KYC Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading seller accounts...
                  </td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    No sellers registered yet.
                  </td>
                </tr>
              ) : (
                sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-4">
                      <span className="font-bold text-white text-sm block">{s.storeName}</span>
                      <span className="text-[11px] text-slate-400">
                        Owner: {s.user?.name} ({s.user?.email})
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-amber-400 font-semibold block">
                        GST: {s.gstin || "Pending"}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        PAN: {s.pan || "Pending"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-300 block">{s.bankName || "HDFC Bank"}</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        IFSC: {s.bankIfsc || "HDFC0000123"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-white text-sm">{s.commissionRate}%</span>
                        <button
                          onClick={() => {
                            setEditingSeller(s);
                            setCustomCommission(String(s.commissionRate));
                          }}
                          className="text-slate-500 hover:text-amber-400 p-0.5"
                          title="Override commission"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-300">
                      {s._count?.products || 0} items
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          s.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : s.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.status !== "APPROVED" && (
                          <button
                            onClick={() => handleUpdateStatus(s.id, "APPROVED")}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-xs transition"
                          >
                            Approve KYC
                          </button>
                        )}
                        {s.status === "APPROVED" && (
                          <button
                            onClick={() => handleUpdateStatus(s.id, "SUSPENDED")}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-xs transition"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Commission Modal */}
      {editingSeller && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-base text-white mb-1">
              Adjust Commission Rate: {editingSeller.storeName}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Override the platform transaction fee percentage for this specific vendor.
            </p>

            <form onSubmit={handleSaveCommission} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Commission Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  required
                  value={customCommission}
                  onChange={(e) => setCustomCommission(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-bold text-sm focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSeller(null)}
                  className="px-4 py-2 border border-slate-800 rounded-lg font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-lg transition"
                >
                  {updating ? "Saving..." : "Save Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
