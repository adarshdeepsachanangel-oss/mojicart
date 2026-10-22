"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Key,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "OPERATIONS_ADMIN",
  "CATALOG_MANAGER",
  "ORDER_MANAGER",
  "SUPPORT_STAFF",
  "FINANCE_MANAGER",
];

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login, logout } = useAuth();

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const res = await login(adminEmail.trim(), adminPassword);
    setLoading(false);

    if (res.success) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("mojicart_admin_session", "true");
      }
      router.push("/admin");
    } else {
      setErrorMsg(res.error || "Invalid administrator credentials. Access denied.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-950/50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            moji<span className="text-amber-500">cart</span>
            <span className="ml-1.5 text-xs bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Super Admin
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Enterprise Operations Center. Administrator credentials required.
          </p>
        </div>

        {/* Non-admin user signed in warning */}
        {user && !ADMIN_ROLES.includes(user.role) && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Currently signed in as {user.name} ({user.role})
              </p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">
                This account does not have Super Admin permissions.
              </p>
              <button
                type="button"
                onClick={() => logout()}
                className="mt-2 text-[10px] font-bold underline hover:text-white"
              >
                Sign Out & Switch to Admin
              </button>
            </div>
          </div>
        )}

        {/* Already logged in as Admin alert */}
        {user && ADMIN_ROLES.includes(user.role) && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-2">
            <div>
              <p className="font-bold">Already Authenticated!</p>
              <p className="text-[11px]">Signed in as {user.name} ({user.role})</p>
            </div>
            <Link
              href="/admin"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition"
            >
              Open Dashboard
            </Link>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@mojicart.in"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-950 text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Authenticate as Super Admin</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
