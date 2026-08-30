"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Rocket, X, Loader2, DollarSign, Calendar, Target } from "lucide-react";
import type { SeedAdCampaign } from "@/lib/store/seed-ads";

const STATUS_STYLE: Record<SeedAdCampaign["status"], string> = {
  pending_approval: "bg-gold/10 text-primary",
  active: "bg-green-100 text-green-700",
  completed: "bg-primary/10 text-primary",
  failed: "bg-red-50 text-red-600",
  rejected: "bg-ink/5 text-ink-soft",
};

const STATUS_LABEL: Record<SeedAdCampaign["status"], string> = {
  pending_approval: "Awaiting your approval",
  active: "Live — spending now",
  completed: "Completed",
  failed: "Failed",
  rejected: "Rejected",
};

const OBJECTIVE_LABEL: Record<SeedAdCampaign["objective"], string> = {
  engagement: "Engagement",
  leads: "Leads",
  reach: "Reach",
};

export default function AdminAdsPage() {
  const [campaigns, setCampaigns] = useState<SeedAdCampaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/ads")
      .then((r) => r.json())
      .then((d) => {
        setCampaigns(d.items ?? []);
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "launch" | "reject") {
    setActingOn(id);
    const res = await fetch(`/api/admin/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      alert(data.error || "Something went wrong");
    }
    setActingOn(null);
    load();
  }

  if (!loaded) return <p className="text-ink-soft text-sm">Loading...</p>;

  const pending = campaigns.filter((c) => c.status === "pending_approval");
  const rest = campaigns.filter((c) => c.status !== "pending_approval");

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Seed Ads</h1>
      <p className="text-ink-soft text-sm mb-8">
        A minimum $10 ad runs every month for 10 days — engagement, leads, and reach rotate
        each month to keep momentum going the rest of the month. Every campaign is created
        paused; nothing spends until you tap Launch below.
      </p>

      {pending.length === 0 && rest.length === 0 && (
        <div className="border border-line rounded-[var(--radius)] bg-white p-10 text-center">
          <span className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Rocket size={22} strokeWidth={1.5} />
          </span>
          <p className="font-display text-xl text-ink mb-2">No seed ads yet</p>
          <p className="text-ink-soft text-sm max-w-md mx-auto leading-relaxed">
            This month's campaign will appear here once generated. Needs{" "}
            <code>metaAdAccountId</code> and <code>metaAdsAccessToken</code> set — see Settings.
          </p>
        </div>
      )}

      {pending.map((c) => (
        <div key={c.id} className="border border-gold/40 bg-gold/[0.04] rounded-[var(--radius)] p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>{STATUS_LABEL[c.status]}</span>
              <p className="font-display text-xl text-ink mt-2">{c.headline}</p>
              <p className="text-sm text-ink-soft mt-1 max-w-lg">{c.primaryText}</p>
            </div>
            {c.creativeImage && (
              <Image src={c.creativeImage} alt={c.headline ?? "Ad creative"} width={96} height={96} className="rounded-md object-cover shrink-0" />
            )}
          </div>

          <div className="flex flex-wrap gap-5 text-xs text-ink-soft mb-5">
            <span className="flex items-center gap-1.5"><DollarSign size={13} /> ${c.budgetUsd} total</span>
            <span className="flex items-center gap-1.5"><Calendar size={13} /> {c.durationDays} days</span>
            <span className="flex items-center gap-1.5"><Target size={13} /> {OBJECTIVE_LABEL[c.objective]}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => act(c.id, "launch")}
              disabled={actingOn === c.id}
              className="flex items-center gap-2 bg-primary text-cream px-5 py-2.5 text-xs uppercase tracking-wide hover:bg-primary-deep transition-colors disabled:opacity-50"
            >
              {actingOn === c.id ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}
              Launch — spend ${c.budgetUsd}
            </button>
            <button
              onClick={() => act(c.id, "reject")}
              disabled={actingOn === c.id}
              className="flex items-center gap-2 border border-line text-ink-soft px-5 py-2.5 text-xs uppercase tracking-wide hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <X size={13} />
              Skip this month
            </button>
          </div>
        </div>
      ))}

      {rest.length > 0 && (
        <div className="space-y-3 mt-2">
          {rest.map((c) => (
            <div key={c.id} className="border border-line rounded-[var(--radius)] bg-white p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  {c.month} — {OBJECTIVE_LABEL[c.objective]} · ${c.budgetUsd} / {c.durationDays} days
                </p>
                {c.errorDetail && <p className="text-xs text-red-600 mt-0.5">{c.errorDetail}</p>}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[c.status]}`}>{STATUS_LABEL[c.status]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
