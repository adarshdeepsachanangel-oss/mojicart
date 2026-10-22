import { RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          7-Day Easy Return & Refund Guarantee
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Transparent, fair, and seamless resolution for all buyers
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-sm">
        <div>
          <h3 className="font-bold text-base text-slate-900 mb-2">1. Return Window</h3>
          <p>
            You can initiate a return or replacement request within 7 calendar days of receiving the package for all eligible items, including clothing, footwear, electronics, and home decor.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900 mb-2">2. Conditions for Return</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>The item must be unused, unwashed, and in its original condition with all tags intact.</li>
            <li>Original packaging, warranty cards, and accessories must be returned together with the product.</li>
            <li>Innerwear, perishable goods, and custom personalized goods are exempt from returns due to hygiene standards.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900 mb-2">3. Refund Processing</h3>
          <p>
            Once our courier partner inspects and picks up the item from your doorstep, the refund is initiated automatically within 24 to 48 hours to your original payment method (Bank account, UPI, or original Card). For COD orders, refund is transferred via instant bank NEFT/UPI.
          </p>
        </div>
      </div>
    </div>
  );
}
