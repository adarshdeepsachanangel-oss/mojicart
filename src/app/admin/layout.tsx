"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  FolderTree,
  Settings,
  ShieldCheck,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Layers,
  Download,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, login, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin session-specific verification state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean | null>(null);

  // Form states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if admin has explicitly verified in this browser session
    const verified =
      typeof window !== "undefined" &&
      sessionStorage.getItem("mojicart_admin_session") === "true";
    setIsAdminUnlocked(verified);
  }, []);

  // Dedicated /admin/login page renders directly
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoginLoading(true);

    const res = await login(adminEmail.trim(), adminPassword);
    setLoginLoading(false);

    if (res.success) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("mojicart_admin_session", "true");
      }
      setIsAdminUnlocked(true);
    } else {
      setErrorMsg(res.error || "Invalid administrator credentials. Access denied.");
    }
  };

  const handleAdminSignOut = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("mojicart_admin_session");
    }
    setIsAdminUnlocked(false);
    await logout();
  };

  // 1. Initial hydration check
  if (isAdminUnlocked === null || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-3" />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Verifying Super Admin Authorization...
        </p>
      </div>
    );
  }

  // 2. Not Unlocked Or Not an Admin -> Show Super Admin Login Screen with Credentials
  const isAuthorized = isAdminUnlocked && user && ADMIN_ROLES.includes(user.role);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Background glow */}
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
              Restricted Enterprise Access. Enter administrator details below.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
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
              disabled={loginLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 transition"
            >
              {loginLoading ? (
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

  // 3. Authorized Admin -> Full Super Admin Management Console
  const links = [
    { href: "/admin", label: "Executive Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Product Moderation", icon: Package },
    { href: "/admin/sellers", label: "Multi-Vendor Sellers", icon: Store },
    { href: "/admin/orders", label: "Global Order Operations", icon: ShoppingCart },
    { href: "/admin/categories", label: "Categories & Catalog", icon: FolderTree },
    { href: "/admin/imports/meesho", label: "Meesho Importer", icon: Download, isNew: true },
    { href: "/admin/cms", label: "Homepage CMS & Banners", icon: Layers },
    { href: "/admin/settings", label: "Marketplace Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-slate-300">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-black text-white text-base">
            Mojicart <span className="text-rose-500">Super Admin</span>
          </span>
        </div>
        <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Storefront
        </Link>
      </div>

      {/* Persistent Left Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "block fixed inset-0 z-50 bg-slate-950" : "hidden"
        } lg:block w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen`}
      >
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <Link href="/admin" className="font-black text-lg text-white tracking-tight block">
                moji<span className="text-amber-500">cart</span>
                <span className="ml-1 text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded">
                  ADMIN
                </span>
              </Link>
              <p className="text-[10px] text-slate-400 mt-0.5">Enterprise Operations Suite</p>
            </div>
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                    active
                      ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-900/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                  <span className="flex-1">{link.label}</span>
                  {(link as any).isNew && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin User Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <p className="font-bold text-xs text-white truncate">{user?.name || "Super Admin"}</p>
              <span className="inline-block text-[10px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.2 rounded border border-rose-500/30 uppercase">
                {user?.role || "SUPER_ADMIN"}
              </span>
            </div>
            <Link
              href="/"
              className="text-slate-400 hover:text-white p-1"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <button
            onClick={handleAdminSignOut}
            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-rose-400 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-900 min-h-screen p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
