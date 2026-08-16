"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Package, Sparkles, MessageCircle, ShoppingBag, AlertTriangle, Calendar, Loader2 } from "lucide-react";
import type { UpcomingOccasion } from "@/lib/ghana-holidays";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ products: 0, drafts: 0, leads: 0 });
  const [occasions, setOccasions] = useState<UpcomingOccasion[]>([]);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const loadOccasions = useCallback(() => {
    fetch("/api/admin/holidays").then((r) => r.json()).then((d) => setOccasions(d.items ?? []));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/content-queue").then((r) => r.json()),
      fetch("/api/admin/leads").then((r) => r.json()),
    ]).then(([products, content, leads]) => {
      setStats({
        products: products.items?.length ?? 0,
        drafts: content.items?.filter((p: { status: string }) => p.status === "draft").length ?? 0,
        leads: leads.items?.length ?? 0,
      });
    });
    loadOccasions();
  }, [loadOccasions]);

  async function generatePromo(occasionId: string) {
    setGeneratingFor(occasionId);
    await fetch("/api/admin/holidays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ occasionId }),
    });
    setGeneratingFor(null);
    alert("Promo draft generated — review it in Content Queue.");
  }

  const cards = [
    { label: "Products", value: stats.products, href: "/admin/products", icon: Package },
    { label: "Pending Content Drafts", value: stats.drafts, href: "/admin/content", icon: Sparkles },
    { label: "Instagram Leads", value: stats.leads, href: "/admin/leads", icon: MessageCircle },
    { label: "Orders", value: 0, href: "/admin/orders", icon: ShoppingBag },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Overview</h1>
      <p className="text-ink-soft text-sm mb-8">DEW by Aphia admin dashboard</p>

      <div className="rounded-md border border-gold/40 bg-gold/[0.06] px-4 py-3 mb-8 flex items-start gap-3">
        <AlertTriangle size={16} className="text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-xs text-ink-soft leading-relaxed">
          Three integrations are code-complete but not yet connected: Instagram publishing/DMs
          (needs <code>IG_ACCESS_TOKEN</code> / <code>IG_BUSINESS_ACCOUNT_ID</code>), WhatsApp
          approval notifications to you (needs <code>WHATSAPP_BUSINESS_TOKEN</code> /{" "}
          <code>WHATSAPP_PHONE_NUMBER_ID</code>, number set in Settings), and newsletter
          sending (needs an email provider like Resend or SendGrid). Everything you approve
          stays queued and ready — it'll go out automatically the moment each is configured.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="block rounded-[var(--radius)] border border-line bg-white p-6 hover:border-primary transition-colors"
          >
            <c.icon size={20} className="text-primary mb-4" strokeWidth={1.5} />
            <p className="font-display text-3xl text-ink mb-1">{c.value}</p>
            <p className="text-xs text-ink-soft">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-primary" strokeWidth={1.5} />
        <h2 className="text-sm font-medium text-ink">Ghanaian Occasions Calendar</h2>
      </div>
      <div className="space-y-3">
        {occasions.map((o) => (
          <div
            key={o.id}
            className={`border rounded-[var(--radius)] p-4 flex items-center justify-between gap-4 ${
              o.withinWindow ? "border-gold/40 bg-gold/[0.04]" : "border-line bg-white"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-ink">
                {o.name} — in {o.daysAway} day{o.daysAway !== 1 ? "s" : ""}
                {!o.withinWindow && <span className="text-ink-soft font-normal"> (not yet promo range)</span>}
              </p>
              <p className="text-xs text-ink-soft mt-0.5">{o.note}</p>
            </div>
            {o.withinWindow && (
              <button
                onClick={() => generatePromo(o.id)}
                disabled={generatingFor === o.id}
                className="flex items-center gap-2 shrink-0 bg-primary text-cream px-4 py-2 text-xs uppercase tracking-wide hover:bg-primary-deep transition-colors disabled:opacity-50"
              >
                {generatingFor === o.id ? <Loader2 size={13} className="animate-spin" /> : null}
                Run a promo for this?
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
