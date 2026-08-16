"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const faqs = [
  {
    q: "How long does a made-to-order piece take?",
    a: "Made-to-order and custom pieces take 10-14 business days to craft before they ship. Ready-to-wear pieces ship within 3-5 business days.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes — we ship worldwide. See our Shipping & Delivery page for estimated timelines by region.",
  },
  {
    q: "Can I customize the fabric or colour of a piece?",
    a: "Absolutely. Visit our Custom Made page to start a bespoke request, or book a consultation to discuss fabric and colour options with our stylist.",
  },
  {
    q: "What's your return policy?",
    a: "Ready-to-wear pieces can be returned within 14 days of delivery. Made-to-order and custom pieces are final sale except in the case of a defect. See Returns & Exchanges for details.",
  },
  {
    q: "How does the AI Stylist work?",
    a: "Tell our AI Stylist about the occasion you're dressing for, and it will recommend fabric, cut, and colour from the DEW archive — then can hand you off to a human stylist for a fitting.",
  },
  {
    q: "Do you offer wholesale or bulk orders?",
    a: "We do, for select partners. Reach out via our Contact page with details of your inquiry.",
  },
];

export default function FAQsPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-16">
      <PageHeader title="FAQs" />
      <div className="divide-y divide-line border-t border-b border-line">
        {faqs.map((f, i) => (
          <div key={f.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left"
            >
              <span className="font-medium text-ink pr-4">{f.q}</span>
              <ChevronDown
                size={18}
                strokeWidth={1.5}
                className={`shrink-0 text-ink-soft transition-transform ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && <p className="pb-5 text-sm text-ink-soft leading-relaxed pr-8">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
