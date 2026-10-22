"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/v1/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Marketplace Global Settings & Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage commission baseline, free delivery thresholds, COD eligibility, and contact details
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Setting updated successfully and applied across marketplace!</span>
        </div>
      )}

      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        {loading ? (
          <p className="text-xs text-slate-500 py-6 text-center">Loading settings...</p>
        ) : (
          settings.map((item) => (
            <div
              key={item.key}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 last:border-0"
            >
              <div className="max-w-md">
                <span className="font-mono text-[11px] font-bold text-rose-400 block">
                  {item.key}
                </span>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">{item.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={item.value}
                  onBlur={(e) => {
                    if (e.target.value !== item.value) {
                      handleUpdate(item.key, e.target.value);
                    }
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:ring-1 focus:ring-rose-500 focus:outline-none min-w-[200px]"
                />
                <button
                  type="button"
                  disabled={savingKey === item.key}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  {savingKey === item.key ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
