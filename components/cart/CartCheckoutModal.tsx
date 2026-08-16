"use client";

import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { whatsappOrderLink, MADE_TO_ORDER_NOTE } from "@/lib/business-info";
import type { CartItem } from "@/lib/cart-context";

interface Props {
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onConfirmed: () => void;
}

export function CartCheckoutModal({ items, subtotal, onClose, onConfirmed }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in your name and phone number.");
      return;
    }
    if (!agreed) {
      setError("Please confirm you understand the deposit and timeline before continuing.");
      return;
    }

    const lines = [
      `Hi DEW by Aphia! I'd like to place an order.`,
      ``,
      `Name: ${name}`,
      `Phone: ${phone}`,
      ``,
      `Items:`,
      ...items.map(
        (it) => `- ${it.name} (${it.color}, size ${it.size}) x${it.qty} — $${it.price * it.qty}`
      ),
      ``,
      `Subtotal: $${subtotal}`,
      ``,
      `I understand this is made to order, with a 50% deposit now and the remaining 50% due when it's ready for pickup or shipment, and 10-14 working days production time.`,
    ];

    window.open(whatsappOrderLink(lines.join("\n")), "_blank", "noopener,noreferrer");
    onConfirmed();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <div className="w-full max-w-md bg-white rounded-[var(--radius)] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-ink">Checkout via WhatsApp</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="rounded-md border border-line bg-primary/[0.03] px-4 py-3 mb-5 space-y-1">
          {items.map((it) => (
            <p key={`${it.productId}-${it.color}-${it.size}`} className="text-xs text-ink-soft">
              {it.name} ({it.color}, {it.size}) × {it.qty} — ${it.price * it.qty}
            </p>
          ))}
          <p className="text-sm text-ink font-medium pt-1">Subtotal: ${subtotal}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cart-name" className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">
              Full Name
            </label>
            <input
              id="cart-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-line px-4 py-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="cart-phone" className="block text-xs uppercase tracking-[0.06em] text-ink-soft mb-2">
              Phone Number
            </label>
            <input
              id="cart-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233..."
              className="w-full border border-line px-4 py-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          <div className="rounded-md border border-gold/40 bg-gold/[0.06] px-4 py-3">
            <p className="text-xs text-ink-soft leading-relaxed">{MADE_TO_ORDER_NOTE}</p>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-ink-soft">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
            I understand these dresses are made to order, require a 50% deposit now with the
            balance due on pickup/shipment, and take 10-14 working days.
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 text-sm tracking-[0.08em] uppercase hover:brightness-95 transition-all"
          >
            <MessageCircle size={16} strokeWidth={2} />
            Continue to WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}
