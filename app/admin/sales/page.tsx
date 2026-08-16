"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { Lead } from "@/lib/store/leads";

const STAGES: { key: Lead["status"]; label: string; color: string }[] = [
  { key: "new", label: "New", color: "bg-ink-soft/20 text-ink-soft" },
  { key: "engaged", label: "Engaged", color: "bg-gold/15 text-primary" },
  { key: "qualified", label: "Qualified", color: "bg-primary/15 text-primary" },
  { key: "won", label: "Won", color: "bg-green-100 text-green-700" },
  { key: "lost", label: "Lost", color: "bg-red-50 text-red-500" },
];

export default function AdminSalesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch("/api/admin/leads").then((r) => r.json()).then((d) => setLeads(d.items ?? []));
  }, []);

  const counts = STAGES.map((s) => ({
    ...s,
    count: leads.filter((l) => l.status === s.key).length,
  }));
  const won = leads.filter((l) => l.status === "won").length;
  const conversionRate = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-3xl text-ink">Sales</h1>
        <Link href="/admin/leads" className="text-xs text-primary underline underline-offset-2">
          Go to Leads inbox →
        </Link>
      </div>
      <p className="text-ink-soft text-sm mb-8">Pipeline overview, sourced from Instagram leads</p>

      <div className="grid sm:grid-cols-5 gap-4 mb-10">
        {counts.map((s) => (
          <div key={s.key} className="border border-line rounded-[var(--radius)] bg-white p-5 text-center">
            <p className="font-display text-3xl text-ink mb-1">{s.count}</p>
            <span className={`inline-block text-[10px] uppercase tracking-wide px-2 py-1 rounded-full ${s.color}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="border border-line rounded-[var(--radius)] bg-white p-6 flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <TrendingUp size={20} strokeWidth={1.5} />
        </span>
        <div>
          <p className="font-display text-2xl text-ink">{conversionRate}%</p>
          <p className="text-xs text-ink-soft">
            Lead-to-won conversion ({won} of {leads.length} total leads)
          </p>
        </div>
      </div>

      {leads.length === 0 && (
        <p className="text-ink-soft text-sm mt-8">
          No leads yet — head to the Leads inbox to simulate an incoming DM and test the sales
          agent, or wait for real Instagram DMs once the webhook is connected.
        </p>
      )}
    </div>
  );
}
