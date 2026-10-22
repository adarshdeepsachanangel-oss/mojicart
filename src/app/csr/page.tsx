import React from "react";
import Link from "next/link";
import { Heart, Globe, Sparkles, Leaf, Users, ShieldCheck, ArrowRight } from "lucide-react";

export default function CSRPage() {
  const initiatives = [
    {
      icon: Users,
      color: "amber",
      title: "Artisan & Weaver Livelihoods",
      desc: "Bridging the rural-urban divide by bringing traditional handloom weavers from Chanderi, Kota, Pochampally, and Varanasi directly onto the national digital stage without exploitative intermediaries.",
      stat: "15,000+ Artisans Supported",
    },
    {
      icon: Leaf,
      color: "emerald",
      title: "Plastic-Neutral Green Fulfillment",
      desc: "Transitioning our national packaging fleet to FSC-certified 100% corrugated paper boxes, paper tape, and water-soluble air pouches to eliminate single-use plastics across our logistics pipeline.",
      stat: "85% Recycled Packaging",
    },
    {
      icon: Sparkles,
      color: "purple",
      title: "Digital Sakhi: Women in Commerce",
      desc: "Comprehensive grassroots digital literacy bootcamps training homemakers and female self-help groups (SHGs) in photography, catalog listing, and digital payments to start profitable home-run businesses.",
      stat: "4,200+ Female Sellers Trained",
    },
    {
      icon: Globe,
      color: "blue",
      title: "Fair Wages & Zero Child Labor Audits",
      desc: "Every seller registered on Mojicart complies with our stringent Ethical Manufacturing Charter, requiring transparent minimum wage compliance, worker health insurance, and zero tolerance for child labor.",
      stat: "100% Verified Factories",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="bg-rose-100 text-rose-800 text-xs font-black uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
          Mojicart Cares
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight leading-tight">
          Empowering Communities Across Bharat
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Commerce has the power to uplift lives. Mojicart Cares is our dedicated social responsibility charter designed to foster ethical manufacturing, environmental sustainability, and rural artisan independence.
        </p>
      </div>

      {/* Grid of Initiatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {initiatives.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {item.stat}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Artisan Spotlight Card */}
      <div className="bg-gradient-to-r from-[#131921] to-[#232f3e] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
            Are you a Craftsperson or NGO?
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            Partner with Mojicart Cares for 0% Commission
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            We offer zero-commission onboarding, subsidized shipping labels, and dedicated product listing assistance to certified Indian artisan clusters and craft NGOs.
          </p>
        </div>
        <Link
          href="/seller/register"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm transition shadow shrink-0"
        >
          Join as an Artisan
        </Link>
      </div>
    </div>
  );
}
