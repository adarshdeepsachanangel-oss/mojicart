import Link from "next/link";
import { Store, ShieldCheck, HeartHandshake, Users, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-3 py-1 rounded-full">
          About Mojicart
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 leading-tight">
          Bharat Ka Apna Trusted Multi-Vendor Marketplace
        </h1>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          Inspired by the expansive variety of Amazon and the direct-from-manufacturer affordability of Meesho, Mojicart empowers verified Indian weavers, artisans, and manufacturers to sell directly to millions of customers.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">Direct Manufacturer Prices</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Eliminating middlemen allows manufacturers from Jaipur, Surat, Delhi, and Bengaluru to offer true factory rates.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">100% Quality Audited</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every seller undergoes strict GSTIN and KYC validation, paired with a mandatory 7-day hassle-free return guarantee.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">Empowering Local MSMEs</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            With transparent 10% platform fees and 7-day automated bank payouts, sellers thrive alongside our platform.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#131921] to-[#232f3e] rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold">Want to sell your products on Mojicart?</h3>
          <p className="text-xs text-slate-300 mt-1">Zero listing fees, instant onboarding, and national logistics support.</p>
        </div>
        <Link
          href="/seller/register"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition shrink-0"
        >
          Become a Seller
        </Link>
      </div>
    </div>
  );
}
