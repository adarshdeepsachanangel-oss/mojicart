import { Headphones, Phone, Mail, HelpCircle, ChevronDown } from "lucide-react";

export default function HelpCenterPage() {
  const faqs = [
    {
      q: "How can I track my shipment?",
      a: "Go to 'Track Order' from the top bar or footer, enter your Order Number (e.g. MOJI-2026-89410), and view real-time courier dispatch status with Delhivery or BlueDart.",
    },
    {
      q: "What is your return and refund policy?",
      a: "We offer a 7-day hassle-free return policy. If you receive a damaged or ill-fitting product, you can request a return directly from your Orders page or call our toll-free support line.",
    },
    {
      q: "Is Cash on Delivery (COD) supported?",
      a: "Yes! Cash on delivery is supported across all serviceable Indian pincodes. You can also pay the courier executive directly via UPI QR code upon doorstep delivery.",
    },
    {
      q: "How can I sell products on Mojicart?",
      a: "Click on 'Sell on Mojicart' in the header, submit your business name, GSTIN, and bank account details. Our catalog moderation team reviews applications within 24 hours.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Mojicart Help & Customer Care
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          We are here to assist with your orders, returns, payments, and seller inquiries
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toll-Free Support</span>
            <p className="text-lg font-black text-slate-900">1800-200-6654</p>
            <p className="text-[11px] text-slate-500">Available 24x7 across all states</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Grievance</span>
            <p className="text-lg font-black text-slate-900">care@mojicart.in</p>
            <p className="text-[11px] text-slate-500">Average response time: 2 hours</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-4 divide-y divide-slate-100">
          {faqs.map((f, i) => (
            <div key={i} className="pt-4 first:pt-0">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-1">{f.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
