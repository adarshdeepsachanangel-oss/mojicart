import React from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Boxes,
  QrCode,
} from "lucide-react";

export default function SellerShippingPage() {
  const steps = [
    {
      num: "01",
      title: "Receive Order Alert",
      desc: "Instant SMS, email, and dashboard alert when a customer purchases your product.",
    },
    {
      num: "02",
      title: "Pack & Print Label",
      desc: "Print standard 1-click AWB shipping label with barcoded dispatch details directly from your portal.",
    },
    {
      num: "03",
      title: "Doorstep Courier Pickup",
      desc: "Our partner couriers (Delhivery / BlueDart / Shadowfax) visit your warehouse or workshop daily.",
    },
    {
      num: "04",
      title: "Fast Delivery & Payout",
      desc: "Real-time GPS tracking sent to the customer. Payout released 7 days after delivery.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-amber-600" />
          Fulfillment by Mojicart (FBM)
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight leading-tight">
          Pan-India Logistics Without The Headache
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Focus on crafting and producing high-quality products. We take care of nationwide courier pickups, surface & express air transport, automated tracking, and customer returns.
        </p>
      </div>

      {/* 3 Strategic Advantages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">28,000+ Pincodes</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Deliver seamlessly to metro cities, Tier-2, Tier-3, and remote rural pin codes across India with verified coverage.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">Daily Doorstep Pickups</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No need to visit parcel counters. Courier executives collect packages directly from your registered manufacturing address.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">Transit Damage Protection</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Comprehensive courier transit insurance protects your merchandise against loss or damage while on the road.
          </p>
        </div>
      </div>

      {/* 4-Step Process */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          How Shipping Works for Sellers
        </h2>
        <p className="text-xs text-slate-500 mb-8">
          Simple 4-step dispatch workflow designed for busy manufacturers
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => (
            <div key={st.num} className="relative">
              <span className="text-3xl font-black text-amber-500/20 block mb-2">
                {st.num}
              </span>
              <h4 className="font-bold text-sm text-slate-900 mb-1">{st.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Card */}
      <div className="bg-gradient-to-r from-[#131921] to-[#232f3e] rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div>
          <h3 className="text-xl font-bold">Ready to ship across India?</h3>
          <p className="text-xs text-slate-300 mt-1">
            Sign up today with zero setup cost and access subsidized bulk courier rates.
          </p>
        </div>
        <Link
          href="/seller/register"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition shadow shrink-0"
        >
          Register as Seller
        </Link>
      </div>
    </div>
  );
}
