import React from "react";
import Link from "next/link";
import { Truck, Clock, IndianRupee, ShieldCheck, MapPin, ArrowRight } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          Shipping Rates & Delivery Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Transparent dispatch timelines, delivery fees, and order tracking details
        </p>
      </div>

      {/* Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <IndianRupee className="w-4 h-4" />
          </div>
          <p className="font-bold text-sm text-slate-900">Free Above ₹499</p>
          <p className="text-[11px] text-slate-500 mt-0.5">₹49 nominal fee on smaller orders</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <p className="font-bold text-sm text-slate-900">2 to 5 Day Delivery</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Express courier dispatches</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <MapPin className="w-4 h-4" />
          </div>
          <p className="font-bold text-sm text-slate-900">28,000+ Pincodes</p>
          <p className="text-[11px] text-slate-500 mt-0.5">All Indian states & Union Territories</p>
        </div>
      </div>

      {/* Main Policy Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-sm">
        <div>
          <h3 className="font-bold text-base text-slate-900 mb-2">1. Standard Delivery Charges</h3>
          <p>
            Mojicart is committed to fair and accessible pricing. All orders with an item subtotal of <strong className="text-slate-900">₹499 or higher receive 100% Free Delivery</strong>. For cart values below ₹499, a flat shipping charge of ₹49 is added at checkout to cover local handling and courier pickup costs.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900 mb-2">2. Estimated Delivery Timelines</h3>
          <p className="mb-3">
            Our seller partners strive to pack and dispatch orders within 24 to 36 hours of confirmation. Expected transit durations:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
            <li><strong className="text-slate-800">Tier 1 Metros:</strong> 2 to 3 business days (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata).</li>
            <li><strong className="text-slate-800">Tier 2 & Tier 3 Cities:</strong> 3 to 5 business days.</li>
            <li><strong className="text-slate-800">Remote / North-East / J&K:</strong> 5 to 7 business days.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900 mb-2">3. Cash on Delivery (COD) Shipments</h3>
          <p>
            Cash on delivery is offered on eligible items up to ₹5,000 across serviceable pincodes. You can inspect the outer tamper-evident packaging before accepting. You may pay the delivery executive in cash or scan their UPI QR code on delivery.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900 mb-2">4. Live Order Tracking</h3>
          <p>
            Once your order is picked up from the manufacturer, an automated SMS and WhatsApp update containing your tracking number (AWB) is dispatched. You can track your shipment anytime via our{" "}
            <Link href="/track-order" className="font-bold text-amber-600 hover:underline">
              Track Order Portal
            </Link>.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900 mb-2">5. Delivery Attempts & Failed Deliveries</h3>
          <p>
            Our logistics partners make up to 3 delivery attempts before returning the shipment (RTO). Please ensure the contact phone number provided during checkout is reachable.
          </p>
        </div>
      </div>
    </div>
  );
}
