"use client";

import { useState } from "react";
import { Heart, ChevronDown, MessageCircle, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";
import { MADE_TO_ORDER_NOTE, WHATSAPP_NUMBER } from "@/lib/business-info";
import { OrderWhatsAppModal } from "./OrderWhatsAppModal";
import { getSalePrice, isOnSale } from "@/lib/pricing";

export function ProductPanel({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]?.name);
  const [size, setSize] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const salePrice = getSalePrice(product);
  const onSale = isOnSale(product);
  const effectivePrice = salePrice ?? product.price;

  function requireSize(): boolean {
    if (!size) {
      setSizeWarning(true);
      return false;
    }
    setSizeWarning(false);
    return true;
  }

  function handleOrderClick() {
    if (requireSize()) setShowOrderModal(true);
  }

  const customOrderHref = `/custom-design?design=${encodeURIComponent(product.name)}&price=${effectivePrice}#book`;

  return (
    <div>
      <p className="eyebrow text-primary mb-2">{product.fabric}</p>
      <h1 className="font-display text-3xl text-ink mb-3">{product.name}</h1>
      <div className="rounded-md border border-primary/20 bg-primary/[0.04] px-3 py-2 mb-4 flex items-start gap-2">
        <Sparkles size={14} className="text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
        <p className="text-xs text-ink-soft leading-relaxed">
          This is a reference design, not held in stock — every DEW by Aphia piece is cut and
          made specifically for you. Starting a custom order recreates <em>this exact design</em>{" "}
          in your size; tell us in the notes if you&rsquo;d like any changes.
        </p>
      </div>
      {onSale ? (
        <div className="mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl text-primary font-bold">${salePrice?.toLocaleString()}</span>
            <span className="text-ink-soft/60 line-through text-lg">${product.price.toLocaleString()}</span>
            <span className="bg-gold text-primary-deep text-sm font-bold px-3 py-1 rounded-full shadow-sm border border-primary-deep/10">
              SAVE {product.salePercent}%
            </span>
          </div>
          <p className="text-xs text-primary font-medium mt-1.5">Limited-time reference price</p>
        </div>
      ) : (
        <p className="text-xl text-primary font-medium mb-3">${product.price.toLocaleString()}</p>
      )}
      <div className="rounded-md border border-gold/50 bg-gold/[0.08] px-4 py-3 mb-6 leading-relaxed max-w-md">
        <p className="text-sm text-ink font-medium mb-1">Made to order, just for you</p>
        <p className="text-sm text-ink-soft leading-relaxed">{MADE_TO_ORDER_NOTE}</p>
      </div>
      <p className="text-ink-soft text-sm leading-relaxed mb-7 max-w-md">{product.description}</p>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.08em] text-ink-soft mb-3">
          Color: <span className="text-ink font-medium">{color}</span>
        </p>
        <div className="flex gap-2.5">
          {product.colors.map((c) => (
            <button
              key={c.name}
              aria-label={c.name}
              onClick={() => setColor(c.name)}
              className={`h-8 w-8 rounded-full border-2 transition-transform ${
                color === c.name ? "border-primary scale-110" : "border-transparent"
              }`}
              style={{ background: c.hex, boxShadow: "0 0 0 1px rgba(0,0,0,0.1) inset" }}
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.08em] text-ink-soft">Size</p>
          <a href="/size-guide" className="text-xs text-primary underline underline-offset-2">
            Size Guide
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSize(s);
                setSizeWarning(false);
              }}
              className={`h-10 min-w-10 px-3 text-sm border transition-colors ${
                size === s
                  ? "border-primary bg-primary text-cream"
                  : "border-line text-ink-soft hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {sizeWarning && <p className="text-xs text-red-600 mt-2">Please select a size to continue.</p>}
      </div>

      <div className="space-y-3 mb-8">
        <a
          href={customOrderHref}
          className="w-full flex items-center justify-center gap-2 bg-primary text-cream py-3.5 text-sm tracking-[0.08em] uppercase hover:bg-primary-deep transition-colors"
        >
          <Sparkles size={16} strokeWidth={1.75} />
          Start Custom Order — This Design
        </a>

        <button
          onClick={handleOrderClick}
          className="w-full flex items-center justify-center gap-2 border border-[#25D366] text-[#1a8347] py-3.5 text-sm tracking-[0.08em] uppercase hover:bg-[#25D366]/5 transition-colors"
        >
          <MessageCircle size={16} strokeWidth={2} />
          Order via WhatsApp
        </button>
        <p className="text-center text-xs text-ink-soft">or message us directly at {WHATSAPP_NUMBER}</p>

        <button
          onClick={() => setWishlisted((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-ink-soft hover:text-primary transition-colors"
        >
          <Heart size={15} strokeWidth={1.6} className={wishlisted ? "fill-primary text-primary" : ""} />
          {wishlisted ? "Added to Wishlist" : "Add to Wishlist"}
        </button>
      </div>

      <div className="divide-y divide-line border-t border-b border-line">
        <Accordion title="Details">
          Made to order from authentic {product.fabric.toLowerCase()}. Every piece is cut and
          finished by hand in our Accra atelier.
        </Accordion>
        <Accordion title="Fabric & Care">
          Dry clean recommended. Store folded or on a padded hanger away from direct sunlight to
          preserve the print's colour.
        </Accordion>
        <Accordion title="Payment & Delivery">{MADE_TO_ORDER_NOTE}</Accordion>
      </div>

      {showOrderModal && (
        <OrderWhatsAppModal
          productName={product.name}
          price={effectivePrice}
          color={color ?? ""}
          size={size}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-sm font-medium text-ink"
      >
        {title}
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="pb-4 text-sm text-ink-soft leading-relaxed">{children}</p>}
    </div>
  );
}
