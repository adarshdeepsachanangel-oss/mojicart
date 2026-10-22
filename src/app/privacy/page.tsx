export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">Privacy Notice & Data Security</h1>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-sm">
        <p>Mojicart values the privacy and security of our customers and sellers. This Privacy Notice outlines how we collect, safeguard, and process your personal and transactional information.</p>
        <h3 className="font-bold text-slate-900 text-base">1. Information We Collect</h3>
        <p>We collect essential order fulfillment information such as your name, delivery address, pincode, phone number, and purchase history. Payment card and net banking transactions are processed via PCI-DSS compliant secure gateways like Razorpay.</p>
        <h3 className="font-bold text-slate-900 text-base">2. How Your Data Is Used</h3>
        <p>Your delivery information is shared only with the relevant seller and courier aggregator strictly for the purpose of doorstep fulfillment and shipment tracking notifications.</p>
        <h3 className="font-bold text-slate-900 text-base">3. Account Security & Deletion</h3>
        <p>Passwords are securely hashed using industry-standard bcrypt algorithms. You may request account deletion or data portability by reaching out to care@mojicart.in.</p>
      </div>
    </div>
  );
}
