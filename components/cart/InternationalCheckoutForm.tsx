"use client";

import { useState, useMemo } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import type { CartItem } from "@/lib/cart-context";
import { SHIPPABLE_COUNTRIES, getShippingFee, getZoneLabel } from "@/lib/shipping-calculator";

export function InternationalCheckoutForm({ items, subtotal }: { items: CartItem[]; subtotal: number }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState(SHIPPABLE_COUNTRIES[0].code);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shippingFee = useMemo(() => getShippingFee(country), [country]);
  const total = subtotal + shippingFee;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          email,
          address: { name, line1, line2, city, postalCode, country },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong — please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Couldn't reach checkout — please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCheckout} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Full Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Address Line 1</label>
        <input required value={line1} onChange={(e) => setLine1(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Address Line 2 (optional)</label>
        <input value={line2} onChange={(e) => setLine2(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">City</label>
          <input required value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Postal Code</label>
          <input required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-primary">
            {SHIPPABLE_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-line pt-4 space-y-1.5">
        <div className="flex justify-between text-sm text-ink-soft">
          <span>Subtotal</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-ink-soft">
          <span>Shipping ({getZoneLabel(country)})</span>
          <span>${shippingFee}</span>
        </div>
        <div className="flex justify-between text-base font-medium text-ink pt-1">
          <span>Total</span>
          <span>${total.toLocaleString()}</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary text-cream py-4 text-sm tracking-[0.08em] uppercase hover:bg-primary-deep transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} strokeWidth={1.75} />}
        {loading ? "Redirecting..." : "Pay with Card"}
      </button>
      <p className="text-center text-xs text-ink-soft">
        Made to order · 10-14 working days before shipment · Secure checkout via Paystack
      </p>
    </form>
  );
}
