import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Heart,
  TrendingUp,
  Laptop,
} from "lucide-react";

export default function CareersPage() {
  const departments = [
    {
      title: "Senior Full-Stack Engineer (Next.js & Node.js)",
      team: "Engineering & Platform",
      location: "Bengaluru, India (Hybrid)",
      type: "Full Time",
      desc: "Help architect lightning-fast checkout experiences, real-time inventory scrapers, and scalable multi-tenant merchant APIs.",
    },
    {
      title: "Staff Database & Distributed Systems Engineer",
      team: "Infrastructure",
      location: "Remote (India)",
      type: "Full Time",
      desc: "Optimize high-throughput catalog indexing, SQLite/PostgreSQL caching layers, and distributed order state machines.",
    },
    {
      title: "Lead Product Manager — Seller Growth",
      team: "Product & Strategy",
      location: "Bengaluru, India",
      type: "Full Time",
      desc: "Drive merchant onboarding velocity, low-commission pricing models, and intuitive catalog management tools for 100k+ MSMEs.",
    },
    {
      title: "Category Manager — Ethnic Wear & Textiles",
      team: "Category & Merchandising",
      location: "Jaipur / Surat / Delhi",
      type: "Full Time",
      desc: "Partner with regional weaver cooperatives and textile manufacturers to curate authentic, direct-from-source Indian collections.",
    },
    {
      title: "Logistics Operations & Dispatch Lead",
      team: "Supply Chain",
      location: "Gurugram, India",
      type: "Full Time",
      desc: "Oversee courier SLA management (Delhivery, BlueDart), fulfillment hubs, and rapid 24-hour dispatch workflows.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Careers at Mojicart
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight leading-tight">
          Build the Commerce Engine of Bharat
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed">
          At Mojicart, we are democratizing e-commerce for millions of manufacturers, artisans, and shoppers across India. Join our mission-driven team solving hard problems at scale.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="#open-roles"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow transition"
          >
            Explore Open Roles
          </a>
          <Link
            href="/about"
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-sm transition"
          >
            Our Mission & Story
          </Link>
        </div>
      </div>

      {/* Perks / Culture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">Ownership & ESOPs</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every team member receives competitive equity ownership with transparent vesting schedules.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">Comprehensive Health</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ₹10 Lakh family health coverage including parental insurance, OPD allowances, and mental wellness care.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Laptop className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">Flexibility & Setup</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Work with modern M3 Apple MacBook Pro equipment plus annual work-from-home ergonomics allowance.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">Continuous Learning</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ₹50,000 annual education grant for courses, conferences, certifications, and technical books.
          </p>
        </div>
      </div>

      {/* Open Roles Listing */}
      <div id="open-roles" className="scroll-mt-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Current Openings ({departments.length})
            </h2>
            <p className="text-xs text-slate-500">
              Apply directly or send your portfolio to careers@mojicart.in
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {departments.map((job, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-amber-400 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {job.team}
                  </span>
                  <span className="text-[10px] font-semibold flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="text-[10px] font-semibold flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {job.type}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{job.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{job.desc}</p>
              </div>

              <div className="shrink-0">
                <a
                  href={`mailto:careers@mojicart.in?subject=Application for ${encodeURIComponent(
                    job.title
                  )}`}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spontaneous Application CTA */}
      <div className="mt-12 bg-gradient-to-r from-[#131921] to-[#232f3e] rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold">Don&apos;t see your role?</h3>
          <p className="text-xs text-slate-300 mt-1">
            We are always eager to meet high-agency builders, engineers, and designers.
          </p>
        </div>
        <a
          href="mailto:careers@mojicart.in?subject=General%20Application%20at%20Mojicart"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition shrink-0"
        >
          Email Us Your CV
        </a>
      </div>
    </div>
  );
}
