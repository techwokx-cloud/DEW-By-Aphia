"use client";

import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
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
    onClose();
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
