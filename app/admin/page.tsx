"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Package, Sparkles, MessageCircle, ShoppingBag, AlertTriangle, Calendar, Loader2 } from "lucide-react";
import type { UpcomingOccasion } from "@/lib/promo-calendar";

interface RedactedSettings {
  [key: string]: unknown;
}

const INTEGRATION_CHECKS: { key: string; label: string; hint: string }[] = [
  { key: "igAccessToken", label: "Instagram publishing/DMs", hint: "IG_ACCESS_TOKEN / IG_BUSINESS_ACCOUNT_ID" },
  { key: "whatsappBusinessToken", label: "WhatsApp owner notifications", hint: "WHATSAPP_BUSINESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID, number set in Settings" },
  { key: "resendSmtpPassword", label: "Newsletter sending", hint: "Resend SMTP password in Settings" },
  { key: "paystackSecretKey", label: "Card checkout", hint: "Paystack secret key in Settings" },
  { key: "json2videoApiKey", label: "Reel video rendering", hint: "json2video API key in Settings" },
  { key: "falApiKey", label: "AI photo generation", hint: "fal.ai API key in Settings — falls back to a plain branded graphic without it" },
  { key: "metaAdsAccessToken", label: "Monthly seed ads", hint: "Meta Ads access token + Ad Account ID in Settings" },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ products: 0, drafts: 0, leads: 0, orders: 0 });
  const [occasions, setOccasions] = useState<UpcomingOccasion[]>([]);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [unconfigured, setUnconfigured] = useState<typeof INTEGRATION_CHECKS>([]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const loadOccasions = useCallback(() => {
    fetch("/api/admin/holidays").then((r) => r.json()).then((d) => setOccasions(d.items ?? []));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/content-queue").then((r) => r.json()),
      fetch("/api/admin/leads").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
    ]).then(([products, content, leads, orders, settings]) => {
      setStats({
        products: products.items?.length ?? 0,
        drafts: content.items?.filter((p: { status: string }) => p.status === "draft").length ?? 0,
        leads: leads.items?.length ?? 0,
        orders: orders.items?.length ?? 0,
      });
      const item = (settings.item ?? {}) as RedactedSettings;
      setUnconfigured(INTEGRATION_CHECKS.filter((c) => !item[c.key]));
      setSettingsLoaded(true);
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
    { label: "Leads", value: stats.leads, href: "/admin/leads", icon: MessageCircle },
    { label: "Orders", value: stats.orders, href: "/admin/orders", icon: ShoppingBag },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Overview</h1>
      <p className="text-ink-soft text-sm mb-8">DEW by Aphia admin dashboard</p>

      {settingsLoaded && unconfigured.length > 0 && (
        <div className="rounded-md border border-gold/40 bg-gold/[0.06] px-4 py-3 mb-8 flex items-start gap-3">
          <AlertTriangle size={16} className="text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="text-xs text-ink-soft leading-relaxed">
            <p className="mb-1.5">
              {unconfigured.length} integration{unconfigured.length === 1 ? " is" : "s are"} code-complete
              but not yet connected — see Settings:
            </p>
            <ul className="space-y-0.5">
              {unconfigured.map((c) => (
                <li key={c.key}>
                  <span className="text-ink">{c.label}</span> — <code>{c.hint}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
