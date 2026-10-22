import React from "react";
import Link from "next/link";
import { Newspaper, Calendar, ArrowRight, Download, Mail, ExternalLink, Sparkles } from "lucide-react";

export default function PressPage() {
  const pressReleases = [
    {
      date: "October 18, 2026",
      tag: "Platform Milestone",
      title: "Mojicart Crosses 50,000 Verified Regional Manufacturers and Handloom Weavers",
      summary: "Bharat's fastest-growing multi-vendor marketplace reports a 310% YoY surge in direct-from-source orders, empowering MSMEs from Jaipur, Surat, Tirupur, and Moradabad.",
    },
    {
      date: "September 02, 2026",
      tag: "Product & Tech",
      title: "Mojicart Deploys Proprietary Automated Catalog Ingestion Engine for Instant Seller Onboarding",
      summary: "Vendors can now convert standard product sheets and live factory URLs into complete multi-variant e-commerce listings with automated MRP-to-wholesale price calculation within seconds.",
    },
    {
      date: "July 24, 2026",
      tag: "Logistics",
      title: "Mojicart Partners with Delhivery & BlueDart for Accelerated 48-Hour Delivery Across 28,000 Indian Pincodes",
      summary: "Direct factory-to-doorstep dispatch integration reduces transit cycle times by 40%, backing Mojicart's signature 7-day hassle-free doorstep return promise.",
    },
    {
      date: "May 15, 2026",
      tag: "CSR & Community",
      title: "Mojicart Unveils 0% Commission Initiative for Rural Women Entrepreneurs and Handloom Cooperatives",
      summary: "Under the 'Mojicart Cares' umbrella, women-owned cottage industries receive 100% platform fee waivers, free professional studio photography, and sponsored digital marketing support.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5">
          <Newspaper className="w-3.5 h-3.5 text-amber-600" />
          Mojicart Newsroom
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3 tracking-tight">
          Press Releases & Announcements
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Stay updated with company milestones, technological breakthroughs, logistics expansions, and our journey building India&apos;s trusted marketplace.
        </p>
      </div>

      {/* Media Kit Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
            Media Inquiries & Assets
          </span>
          <h3 className="text-lg sm:text-xl font-bold mt-1">
            Mojicart Official Press & Media Kit
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Download high-res brand logos, founder headshots, product screenshots, and official fact sheets.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href="mailto:press@mojicart.in"
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>press@mojicart.in</span>
          </a>
        </div>
      </div>

      {/* Press Releases Feed */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900">Recent Press Releases</h2>

        {pressReleases.map((item, idx) => (
          <article
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 hover:border-amber-400 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 text-xs mb-2">
              <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-amber-200/60">
                {item.tag}
              </span>
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Calendar className="w-3 h-3" />
                {item.date}
              </span>
            </div>

            <h3 className="font-bold text-lg sm:text-xl text-slate-900 mb-2 leading-snug">
              {item.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {item.summary}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
