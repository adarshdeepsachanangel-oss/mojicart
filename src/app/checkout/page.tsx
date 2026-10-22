"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponFromQuery = searchParams.get("coupon") || "";

  const { user, loading: authLoading, refreshUser } = useAuth();
  const { items, subtotal, shippingFee, finalTotal, clearCart } = useCart();

  // Address State
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "110001",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "New Delhi",
    state: "Delhi",
    addressType: "HOME",
    saveAddress: true,
  });

  // Account / Login Credentials State for checkout
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState(couponFromQuery);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def.id);
    } else {
      setUseCustomAddress(true);
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Validate coupon discount if preset
  useEffect(() => {
    if (couponCode && subtotal > 0) {
      fetch("/api/v1/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartSubtotal: subtotal }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setCouponDiscount(data.coupon.discountAmount);
          }
        })
        .catch(() => {});
    }
  }, [couponCode, subtotal]);

  const payableAmount = Math.max(0, finalTotal - couponDiscount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const payload: any = {
        paymentMethod,
        couponCode: couponCode || null,
        email: email.trim(),
        password: password.trim(),
        items: items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId || null,
          quantity: it.quantity,
        })),
      };

      if (!useCustomAddress && selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        payload.customAddress = {
          ...customAddress,
          email: email.trim(),
        };
      }

      const res = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order placement failed");
      }

      await clearCart();
      if (data.authenticated) {
        try {
          await refreshUser();
        } catch {}
      }
      setOrderSuccess(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // If order was placed, show confirmation screen
  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Thank you! Order Confirmed
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Your order{" "}
          <span className="font-bold text-slate-950">{orderSuccess.orderNumber}</span> has been
          placed and is now being packed by the seller.
          {email && (
            <span className="block mt-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 py-2 px-3 rounded-xl max-w-md mx-auto">
              ✓ Registered as <strong>{email}</strong>! You can log in anytime with your password to view real-time delivery status & tracking.
            </span>
          )}
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-sm space-y-3 mb-6 text-xs">
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Order Number:</span>
            <span className="font-bold text-slate-900">{orderSuccess.orderNumber}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Total Amount:</span>
            <span className="font-black text-slate-950 text-sm">₹{orderSuccess.totalAmount}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Payment Mode:</span>
            <span className="font-bold text-slate-900">{orderSuccess.paymentMethod}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Estimated Delivery:</span>
            <span className="font-bold text-emerald-600">
              {orderSuccess.estimatedDeliveryDate
                ? new Date(orderSuccess.estimatedDeliveryDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })
                : "3 - 5 Days"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tracking AWB:</span>
            <span className="font-mono font-bold text-slate-700">{orderSuccess.trackingNumber}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account/orders"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition"
          >
            View Order Status
          </Link>
          <Link
            href="/"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-xl text-xs transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !authLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-semibold text-slate-500 mb-4">No items in your cart to checkout.</p>
        <Link
          href="/"
          className="bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Checkout Stepper Header */}
      <div className="mb-8 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>Secure Indian Multi-Vendor Checkout</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            100% Purchase Protection with 7-Day Returns
          </p>
        </div>
        <Link href="/cart" className="text-xs font-bold text-amber-600 hover:underline">
          ← Back to Cart
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Address & Payment (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Delivery Address & Account */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="font-black text-sm uppercase tracking-wide text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                  1
                </span>
                <span>Delivery Address & Account</span>
              </h2>
            </div>

            {/* User Account Login / Registration State */}
            {user ? (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Signed in as <strong>{user.name}</strong> ({user.email})</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Orders will be saved to your account
                </span>
              </div>
            ) : (
              <div className="mb-5 p-4 bg-gradient-to-r from-amber-50 to-orange-50/40 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-xs text-slate-900">Account & Login Credentials</span>
                  </div>
                  <Link href="/login?redirect=/checkout" className="text-[11px] font-bold text-amber-600 hover:underline">
                    Already have an account? Sign In
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. priya@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white pr-9 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Order tracking and updates will be sent here.</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Set Account Password *</span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] font-bold text-amber-600 hover:underline flex items-center gap-0.5"
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Create a password (min 6 chars)"
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white pr-9 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-emerald-700 font-medium mt-1">
                      ✓ Login anytime with this email & password to check order status.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Addresses List */}
            {user && user.addresses && user.addresses.length > 0 && !useCustomAddress && (
              <div className="space-y-3 mb-4">
                {user.addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-4 rounded-xl border cursor-pointer transition ${
                      selectedAddressId === addr.id
                        ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="addressSelection"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-amber-500 focus:ring-amber-500"
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{addr.fullName}</span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {addr.addressType}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">
                          {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ""}
                          {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                        </p>
                        <p className="text-slate-500 mt-0.5">Phone: {addr.phone}</p>
                      </div>
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  onClick={() => setUseCustomAddress(true)}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 mt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Deliver to a new address
                </button>
              </div>
            )}

            {/* New / Custom Address Form */}
            {useCustomAddress && (
              <div className="space-y-3 text-xs">
                {user && user.addresses && user.addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseCustomAddress(false)}
                    className="text-amber-600 font-bold hover:underline mb-2 block"
                  >
                    ← Choose from saved addresses
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={customAddress.fullName}
                      onChange={(e) => setCustomAddress({ ...customAddress, fullName: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customAddress.phone}
                      onChange={(e) => setCustomAddress({ ...customAddress, phone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 110001"
                      value={customAddress.pincode}
                      onChange={(e) => setCustomAddress({ ...customAddress, pincode: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi"
                      value={customAddress.city}
                      onChange={(e) => setCustomAddress({ ...customAddress, city: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delhi"
                      value={customAddress.state}
                      onChange={(e) => setCustomAddress({ ...customAddress, state: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flat, House no., Building, Street *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Lotus Greens, Barakhamba Road"
                    value={customAddress.addressLine1}
                    onChange={(e) => setCustomAddress({ ...customAddress, addressLine1: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="Near Metro Station or Temple"
                    value={customAddress.landmark}
                    onChange={(e) => setCustomAddress({ ...customAddress, landmark: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="font-black text-sm uppercase tracking-wide text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                  2
                </span>
                <span>Select Payment Method</span>
              </h2>
            </div>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className="block p-4 rounded-xl border border-amber-500 bg-amber-50/40 ring-1 ring-amber-500 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900">
                        Cash on Delivery (Pay with Cash / UPI on Delivery)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Pay cash or scan courier QR code using any UPI app (GPay, PhonePe, Paytm) upon package arrival
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Popular
                  </span>
                </div>
              </label>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Risk-Free: Zero advance payment required. Pay only after verified courier reaches your doorstep.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Confirmation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wide text-slate-900 pb-3 border-b border-slate-100">
              Order Review ({items.length} items)
            </h3>

            {/* Compact items list */}
            <div className="max-h-56 overflow-y-auto space-y-3 pr-1 text-xs divide-y divide-slate-100">
              {items.map((it) => (
                <div key={it.id} className="pt-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{it.title}</p>
                    <p className="text-slate-400 text-[11px]">
                      Qty: {it.quantity} × ₹{it.price.toFixed(0)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{(it.price * it.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(0)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Savings ({couponCode}):</span>
                  <span>- ₹{couponDiscount.toFixed(0)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    <span className="font-semibold text-slate-900">₹{shippingFee}</span>
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-sm">Total Payable:</span>
                <span className="font-black text-xl text-slate-950">
                  ₹{payableAmount.toFixed(0)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow flex items-center justify-center gap-2 transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>By placing your order, you agree to Mojicart terms.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
