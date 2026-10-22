import React from "react";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  CreditCard,
  KeyRound,
  FileCheck,
  AlertTriangle,
  Mail,
  ArrowRight,
} from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          Security & Trust at Mojicart
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Your payments, personal data, and consumer rights are safeguarded by bank-grade security protocols
        </p>
      </div>

      {/* 4 Security Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">256-Bit SSL/TLS Encryption</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Every request between your browser and Mojicart servers is encrypted with TLS 1.3 cryptographic cipher suites.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">PCI-DSS Level 1 Compliance</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Payment information is tokenized via RBI-licensed gateways (Razorpay, NPCI UPI, RuPay). We never store CVV or card PINs.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Buyer Protection Escrow</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Payments are held securely in nodal escrow accounts and only settled to sellers after the 7-day return inspection window.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">GSTIN & KYC Verified Sellers</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Vendors undergo mandatory government GSTIN verification and bank account name-match validation before catalog approval.
            </p>
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-sm">
        <div>
          <h3 className="font-bold text-base text-slate-900 mb-2">1. Anti-Phishing & Safe Shopping</h3>
          <p>
            Mojicart representatives will never call or SMS asking for your bank account password, debit card OTP, UPI MPIN, or remote access app downloads (AnyDesk/TeamViewer). Always verify you are on <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">https://mojicart.in</code>.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900 mb-2">2. Vulnerability Disclosure & Bug Bounty</h3>
          <p>
            We take information security seriously and welcome reports from cybersecurity researchers. If you uncover a vulnerability or data leakage risk, please report it promptly to:
          </p>
          <div className="mt-2 flex items-center gap-2 font-mono text-xs bg-slate-100 p-3 rounded-xl border border-slate-200">
            <Mail className="w-4 h-4 text-slate-500" />
            <a href="mailto:security@mojicart.in" className="text-amber-600 font-bold hover:underline">
              security@mojicart.in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
