"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, CreditCard } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { CartCheckoutModal } from "@/components/cart/CartCheckoutModal";
import { InternationalCheckoutForm } from "@/components/cart/InternationalCheckoutForm";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, clear } = useCart();
  const [showWhatsAppCheckout, setShowWhatsAppCheckout] = useState(false);
  const [channel, setChannel] = useState<"local" | "international">("local");

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
          <ShoppingBag size={26} strokeWidth={1.5} />
        </span>
        <h1 className="font-display text-2xl text-ink mb-2">Your cart is empty</h1>
        <p className="text-ink-soft text-sm mb-8">
          Browse the shop and add a piece or two.
        </p>
        <Button href="/shop">Browse Shop</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16">
      <h1 className="font-display text-3xl text-ink mb-1">Your Cart</h1>
      <p className="text-ink-soft text-sm mb-8">
        {items.reduce((n, i) => n + i.qty, 0)} item{items.length !== 1 ? "s" : ""}
      </p>

      <div className="divide-y divide-line border-t border-b border-line mb-8">
        {items.map((it) => (
          <div key={`${it.productId}-${it.color}-${it.size}`} className="flex gap-4 py-5">
            <div className="relative h-24 w-20 shrink-0 rounded-md overflow-hidden border border-line">
              <Image src={it.image} alt={it.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/shop/${it.slug}`} className="text-sm font-medium text-ink hover:text-primary">
                {it.name}
              </Link>
              <p className="text-xs text-ink-soft mt-0.5">
                {it.color} · Size {it.size}
              </p>
              <p className="text-sm text-primary font-medium mt-1">${it.price}</p>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-line">
                  <button
                    onClick={() => updateQty(it.productId, it.color, it.size, it.qty - 1)}
                    disabled={it.qty <= 1}
                    aria-label="Decrease quantity"
                    className="p-2 text-ink-soft hover:text-primary disabled:opacity-30"
                  >
                    <Minus size={13} strokeWidth={2} />
                  </button>
                  <span className="w-8 text-center text-sm">{it.qty}</span>
                  <button
                    onClick={() => updateQty(it.productId, it.color, it.size, it.qty + 1)}
                    aria-label="Increase quantity"
                    className="p-2 text-ink-soft hover:text-primary"
                  >
                    <Plus size={13} strokeWidth={2} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(it.productId, it.color, it.size)}
                  aria-label="Remove item"
                  className="text-ink-soft hover:text-red-600 transition-colors"
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <p className="text-sm text-ink font-medium shrink-0">${it.price * it.qty}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8">
        <button onClick={clear} className="text-xs text-ink-soft hover:text-red-600 underline underline-offset-2">
          Clear cart
        </button>
        <p className="text-lg text-ink font-medium">Subtotal: ${subtotal}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => setChannel("local")}
          className={`py-3 text-xs uppercase tracking-wide border transition-colors ${
            channel === "local" ? "border-primary bg-primary text-cream" : "border-line text-ink-soft"
          }`}
        >
          <MessageCircle size={14} className="inline mr-1.5 -mt-0.5" strokeWidth={2} />
          Local (Ghana) — WhatsApp
        </button>
        <button
          onClick={() => setChannel("international")}
          className={`py-3 text-xs uppercase tracking-wide border transition-colors ${
            channel === "international" ? "border-primary bg-primary text-cream" : "border-line text-ink-soft"
          }`}
        >
          <CreditCard size={14} className="inline mr-1.5 -mt-0.5" strokeWidth={2} />
          International — Card
        </button>
      </div>

      {channel === "local" ? (
        <>
          <button
            onClick={() => setShowWhatsAppCheckout(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 text-sm tracking-[0.08em] uppercase hover:brightness-95 transition-all"
          >
            Checkout via WhatsApp
          </button>
          <p className="text-center text-xs text-ink-soft mt-3">
            50% deposit required to begin production · 10-14 working days
          </p>
        </>
      ) : (
        <InternationalCheckoutForm items={items} subtotal={subtotal} />
      )}

      {showWhatsAppCheckout && (
        <CartCheckoutModal
          items={items}
          subtotal={subtotal}
          onClose={() => setShowWhatsAppCheckout(false)}
          onConfirmed={() => {
            setShowWhatsAppCheckout(false);
            clear();
          }}
        />
      )}
    </div>
  );
}
