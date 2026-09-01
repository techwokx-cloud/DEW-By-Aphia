"use client";

import { useState } from "react";
import { X, MessageCircle, Loader2 } from "lucide-react";
import { whatsappOrderLink, MADE_TO_ORDER_NOTE } from "@/lib/business-info";

interface OrderModalProps {
  productName: string;
  price: number;
  color: string;
  size: string | null;
  onClose: () => void;
}

export function OrderWhatsAppModal({ productName, price, color, size, onClose }: OrderModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Please fill in your name, phone number, and email.");
      return;
    }
    if (!agreed) {
      setError("Please confirm you understand the deposit and timeline before continuing.");
      return;
    }
    setError("");
    setSubmitting(true);

    // WhatsApp is the "fast, quick response" path — open it in a new tab
    // so the customer's question gets seen immediately, while this tab
    // continues to the deposit payment step below.
    const message = [
      `Hi DEW by Aphia! I'd like to place an order.`,
      ``,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Dress: ${productName} (${color}${size ? `, size ${size}` : ""})`,
      `Price: $${price}`,
      ``,
      `I understand this is made to order, with a 50% deposit now and the remaining 50% due when it's ready for pickup or shipment, and 10-14 working days production time.`,
    ].join("\n");
    window.open(whatsappOrderLink(message), "_blank", "noopener,noreferrer");

    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, designName: `${productName} (${color}${size ? `, ${size}` : ""})`, price }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        // Payment isn't set up yet — WhatsApp still went through, so the
        // order isn't lost, just not paid online. Let them know plainly.
        setError(data.error || "WhatsApp message sent — we'll follow up on payment directly since online payment isn't available right now.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start payment — WhatsApp message was still sent.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <div className="w-full max-w-md bg-white rounded-[var(--radius)] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-ink">Order via WhatsApp</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="rounded-md border border-line bg-primary/[0.03] px-4 py-3 mb-5">
          <p className="text-sm text-ink font-medium">{productName}</p>
          <p className="text-xs text-ink-soft mt-0.5">
            {color}
            {size ? ` · Size ${size}` : ""} · ${price}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="order-name" className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">
              Full Name
            </label>
            <input
              id="order-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-line px-4 py-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="order-phone" className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">
                Phone Number
              </label>
              <input
                id="order-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233..."
                className="w-full border border-line px-4 py-3 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="order-email" className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">
                Email
              </label>
              <input
                id="order-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line px-4 py-3 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-md border border-gold/40 bg-gold/[0.06] px-4 py-3">
            <p className="text-xs text-ink-soft leading-relaxed">{MADE_TO_ORDER_NOTE}</p>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5"
            />
            I understand this dress is made to order, requires a 50% deposit now with the
            balance due on pickup/shipment, and takes 10-14 working days.
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 text-sm tracking-[0.08em] uppercase hover:brightness-95 transition-all disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} strokeWidth={2} />}
            {submitting ? "Starting payment…" : "Message Us & Pay Deposit"}
          </button>
          <p className="text-center text-xs text-ink-soft">
            Opens WhatsApp for a quick response, then takes you to pay your 50% deposit.
          </p>
        </form>
      </div>
    </div>
  );
}
