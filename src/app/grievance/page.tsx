import React from "react";
import Link from "next/link";
import {
  Scale,
  ShieldAlert,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function GrievancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <Scale className="w-6 h-6" />
        </div>
        <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-3 py-1 rounded-full">
          Statutory Compliance
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
          Grievance Redressal Mechanism
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          In accordance with the Information Technology Act, 2000, Intermediary Guidelines Rules 2021, and Consumer Protection (E-Commerce) Rules 2020.
        </p>
      </div>

      {/* Official Grievance Officer Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>Designated Grievance & Nodal Officer</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
          <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Officer Details
            </span>
            <p className="font-bold text-slate-900">Mr. Vikramaditya Sharma</p>
            <p className="text-xs text-slate-500">
              Head of Regulatory Compliance & Consumer Grievance
            </p>
            <p className="text-xs text-slate-500">
              Mojicart Technologies Private Limited
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Contact Channels
            </span>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <a href="mailto:grievance@mojicart.in" className="font-bold text-amber-600 hover:underline">
                grievance@mojicart.in
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-800 font-semibold">+91 1800-200-6654 (Ext. 4)</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-500">
              <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Monday to Friday, 10:00 AM – 6:00 PM IST (Excl. Public Holidays)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 flex items-start gap-3">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Registered Office Address:</span>
            <p className="text-slate-500 mt-0.5">
              Mojicart Technologies Pvt. Ltd., 4th Floor, Innovation Park, Sector 44, Gurugram, Haryana - 122003, India.
            </p>
          </div>
        </div>
      </div>

      {/* Escalation Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-sm">
        <h3 className="font-bold text-base text-slate-900 mb-2">Grievance Escalation Process</h3>

        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div>
              <h4 className="font-bold text-slate-900">Level 1: Customer Care Support</h4>
              <p className="text-slate-500 mt-0.5">
                For order status, damaged items, and refund questions, first contact our 24x7 help desk via{" "}
                <Link href="/help" className="text-amber-600 font-bold hover:underline">
                  Help Center
                </Link>{" "}
                or email <code className="bg-slate-100 px-1 py-0.5 rounded">care@mojicart.in</code>. Most queries are resolved within 24 to 48 hours.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <div>
              <h4 className="font-bold text-slate-900">Level 2: Escalation to Grievance Officer</h4>
              <p className="text-slate-500 mt-0.5">
                If your concern is not resolved within 72 hours, or if you wish to file a formal complaint under the Information Technology Intermediary Rules, write directly to <code className="bg-slate-100 px-1 py-0.5 rounded">grievance@mojicart.in</code> with your Order Number and prior Ticket ID.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <div>
              <h4 className="font-bold text-slate-900">Statutory Timelines</h4>
              <p className="text-slate-500 mt-0.5">
                We acknowledge receipt of all grievance complaints within 48 hours and provide redressed disposal within 15 calendar days from the date of receipt, as mandated by Indian law.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
