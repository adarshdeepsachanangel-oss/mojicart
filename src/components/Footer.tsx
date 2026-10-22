"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw, Headphones, CreditCard, Lock } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="bg-[#131921] text-slate-300 text-xs mt-16 border-t border-slate-800">
      {/* Trust Badges Strip */}
      <div className="bg-[#232f3e] border-b border-slate-700/60 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Free & Fast Delivery</p>
              <p className="text-slate-400 text-xs">On orders above ₹499 across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">7-Day Easy Returns</p>
              <p className="text-slate-400 text-xs">No questions asked return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">100% Safe Delivery</p>
              <p className="text-slate-400 text-xs">Cash on Delivery & Pay at Doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">24x7 Support Help</p>
              <p className="text-slate-400 text-xs">Toll-free 1800-200-6654</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-bold text-sm mb-3">About Mojicart</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/about" className="hover:text-amber-400 transition">About Our Marketplace</Link></li>
            <li><Link href="/careers" className="hover:text-amber-400 transition">Careers</Link></li>
            <li><Link href="/press" className="hover:text-amber-400 transition">Press Releases</Link></li>
            <li><Link href="/csr" className="hover:text-amber-400 transition">Mojicart Cares</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">Sell on Mojicart</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/seller" className="hover:text-amber-400 font-semibold text-amber-400/90 transition">Seller Dashboard</Link></li>
            <li><Link href="/seller/register" className="hover:text-amber-400 transition">Start Selling Today</Link></li>
            <li><Link href="/seller/fees" className="hover:text-amber-400 transition">Lowest Commission Fees</Link></li>
            <li><Link href="/seller/shipping" className="hover:text-amber-400 transition">Fulfillment by Mojicart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">Customer Support</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/help" className="hover:text-amber-400 transition">Help Center & FAQ</Link></li>
            <li><Link href="/track-order" className="hover:text-amber-400 transition">Track Your Order</Link></li>
            <li><Link href="/returns" className="hover:text-amber-400 transition">Return & Refund Policy</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-amber-400 transition">Shipping Rates & Policies</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">Consumer Policy</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/terms" className="hover:text-amber-400 transition">Terms of Use</Link></li>
            <li><Link href="/privacy" className="hover:text-amber-400 transition">Privacy Notice</Link></li>
            <li><Link href="/security" className="hover:text-amber-400 transition">Security & Trust</Link></li>
            <li><Link href="/grievance" className="hover:text-amber-400 transition">Grievance Redressal</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Payment Badges */}
      <div className="border-t border-slate-800 bg-[#0f141b] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">moji<span className="text-amber-500">cart</span></span>
            <span className="text-slate-500">|</span>
            <p className="text-slate-400 text-xs">
              © {new Date().getFullYear()} Mojicart Technologies Private Limited. All Rights Reserved.
            </p>
          </div>

          {/* Secure Payment Badges */}
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <span className="flex items-center gap-1 font-medium"><Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded font-semibold text-slate-200">Cash on Delivery</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded font-semibold text-slate-200">UPI on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
