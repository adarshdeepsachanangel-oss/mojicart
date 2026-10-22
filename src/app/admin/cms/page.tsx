"use client";

import React, { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Eye,
  EyeOff,
  Image,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function AdminCMSPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Banner Modal
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerLinkUrl, setBannerLinkUrl] = useState("/category/women-ethnic");
  const [bannerTag, setBannerTag] = useState("SPECIAL FESTIVE DEAL");
  const [submitting, setSubmitting] = useState(false);

  const fetchCMS = async () => {
    try {
      const res = await fetch("/api/v1/admin/cms");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
        setSections(data.sections || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  const handleToggleBanner = async (bannerId: string, currentActive: boolean) => {
    try {
      await fetch("/api/v1/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bannerId, type: "banner", isActive: !currentActive }),
      });
      fetchCMS();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSection = async (sectionId: string, currentActive: boolean) => {
    try {
      await fetch("/api/v1/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sectionId, type: "section", isActive: !currentActive }),
      });
      fetchCMS();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "banner",
          title: bannerTitle,
          subtitle: bannerSubtitle,
          imageUrl: bannerImageUrl || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80",
          linkUrl: bannerLinkUrl,
          tagText: bannerTag,
        }),
      });
      if (res.ok) {
        setShowAddBanner(false);
        setBannerTitle("");
        setBannerSubtitle("");
        fetchCMS();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Homepage CMS & Dynamic Section Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure promotional hero banners, campaign tags, and toggle homepage rails without code edits
          </p>
        </div>

        <button
          onClick={() => setShowAddBanner(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      {/* Hero Banners CMS Section */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Image className="w-4 h-4 text-amber-500" />
          <span>Active Hero Promotional Banners</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition ${
                b.isActive ? "bg-slate-900 border-slate-800" : "bg-slate-900/40 border-slate-800/40 opacity-60"
              }`}
            >
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-32 object-cover rounded-lg border border-slate-800 mb-3"
                />
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded uppercase">
                  {b.tagText || "PROMO"}
                </span>
                <h4 className="font-bold text-xs text-white mt-1.5">{b.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{b.subtitle}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Link: {b.linkUrl}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  {b.isActive ? "🟢 Live on Store" : "⚪ Hidden"}
                </span>
                <button
                  onClick={() => handleToggleBanner(b.id, b.isActive)}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                    b.isActive
                      ? "bg-slate-800 text-rose-400 hover:bg-slate-700"
                      : "bg-emerald-600 text-white hover:bg-emerald-500"
                  }`}
                >
                  {b.isActive ? "Deactivate" : "Publish"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Rails Control */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-rose-500" />
          <span>Homepage Sections & Product Rails Configuration</span>
        </h3>

        <div className="divide-y divide-slate-800/80">
          {sections.map((sec) => (
            <div key={sec.id} className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{sec.title}</span>
                  <span className="bg-slate-800 text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded">
                    {sec.sectionKey}
                  </span>
                </div>
                {sec.subtitle && (
                  <p className="text-slate-400 text-[11px] mt-0.5">{sec.subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggleSection(sec.id, sec.isActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    sec.isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {sec.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{sec.isActive ? "Active on Home" : "Disabled"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Banner Modal */}
      {showAddBanner && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base text-white">Create Promotional Hero Banner</h3>
              <button onClick={() => setShowAddBanner(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Banner Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Diwali Festive Sale"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Sub-Headline Description</label>
                <input
                  type="text"
                  placeholder="e.g. Up to 70% Off on Indian ethnic wear & gadgets"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tagline Pill</label>
                <input
                  type="text"
                  placeholder="e.g. LIMITED PERIOD ONLY"
                  value={bannerTag}
                  onChange={(e) => setBannerTag(e.target.value)}
                  className="w-full uppercase bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">High-Res Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Click URL</label>
                <input
                  type="text"
                  placeholder="/category/under-199"
                  value={bannerLinkUrl}
                  onChange={(e) => setBannerLinkUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBanner(false)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2 rounded-lg transition"
                >
                  {submitting ? "Publishing..." : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
