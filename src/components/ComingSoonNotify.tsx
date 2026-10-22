"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, Send, Sparkles } from "lucide-react";

interface ComingSoonNotifyProps {
  categoryName: string;
}

export default function ComingSoonNotify({ categoryName }: ComingSoonNotifyProps) {
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;

    setLoading(true);
    // Simulate notification registration
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-xs sm:text-sm flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 max-w-md mx-auto">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="text-left">
          <p className="font-bold">You are on the priority VIP alert list!</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            We will alert you on <span className="font-semibold">{contact}</span> as soon as fresh products arrive in {categoryName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Bell className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Enter Email or WhatsApp number"
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition whitespace-nowrap"
        >
          {loading ? (
            <span>Saving...</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Notify Me</span>
            </>
          )}
        </button>
      </div>
      <p className="text-[10px] text-slate-500 mt-2 text-center flex items-center justify-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-500" />
        Get exclusive launch discounts & early bird access
      </p>
    </form>
  );
}
