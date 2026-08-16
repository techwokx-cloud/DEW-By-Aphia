"use client";

import { useEffect, useState, useCallback } from "react";
import { Mail, Sparkles, Check, X, Loader2 } from "lucide-react";
import type { Subscriber } from "@/lib/store/subscribers";
import type { NewsletterDraft } from "@/lib/store/newsletter-queue";

const STATUS_STYLE: Record<NewsletterDraft["status"], string> = {
  draft: "bg-gold/10 text-primary",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-50 text-red-600",
  sent: "bg-primary/10 text-primary",
};

export default function AdminMarketingPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [drafts, setDrafts] = useState<NewsletterDraft[]>([]);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/subscribers").then((r) => r.json()).then((d) => setSubscribers(d.items ?? []));
    fetch("/api/admin/newsletter").then((r) => r.json()).then((d) => setDrafts(d.items ?? []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generateDraft() {
    setGenerating(true);
    await fetch("/api/admin/newsletter", { method: "POST" });
    setGenerating(false);
    load();
  }

  async function act(id: string, action: "approve" | "reject") {
    const res = await fetch(`/api/admin/newsletter/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
    if (action === "reject") return;
    const data = await res.json();
    if (!data.emailSent) {
      alert(
        "Approved. It won't actually email subscribers yet though — that needs an email provider (e.g. Resend or SendGrid) connected, which isn't set up. The approved draft is saved and ready to send once that's configured."
      );
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Marketing</h1>
      <p className="text-ink-soft text-sm mb-8">Newsletter subscribers and agent-drafted campaigns</p>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <div>
          <h2 className="text-sm font-medium text-ink mb-4 flex items-center gap-2">
            <Mail size={15} strokeWidth={1.5} />
            Subscribers ({subscribers.length})
          </h2>
          <div className="border border-line rounded-[var(--radius)] bg-white overflow-hidden divide-y divide-line max-h-[420px] overflow-y-auto">
            {subscribers.length === 0 ? (
              <p className="text-xs text-ink-soft p-4">No subscribers yet — they'll appear here as people sign up in the footer.</p>
            ) : (
              subscribers.map((s) => (
                <div key={s.id} className="px-4 py-3">
                  <p className="text-sm text-ink">{s.email}</p>
                  {s.whatsapp && <p className="text-xs text-ink-soft mt-0.5">WhatsApp: {s.whatsapp}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-ink">Newsletter Drafts</h2>
            <button
              onClick={generateDraft}
              disabled={generating}
              className="flex items-center gap-2 bg-primary text-cream px-4 py-2 text-xs uppercase tracking-wide hover:bg-primary-deep transition-colors disabled:opacity-50"
            >
              {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} strokeWidth={2} />}
              Generate Draft
            </button>
          </div>

          {drafts.length === 0 ? (
            <p className="text-ink-soft text-sm">No drafts yet — click "Generate Draft" to have the agent write one.</p>
          ) : (
            <div className="space-y-4">
              {drafts.map((d) => (
                <div key={d.id} className="border border-line rounded-[var(--radius)] bg-white p-5">
                  <span className={`inline-block text-[10px] uppercase tracking-wide px-2 py-1 rounded-full mb-2 ${STATUS_STYLE[d.status]}`}>
                    {d.status}
                  </span>
                  <p className="font-medium text-ink text-sm mb-1">{d.subject}</p>
                  <p className="text-xs text-ink-soft whitespace-pre-line leading-relaxed">{d.body}</p>
                  {d.status === "draft" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => act(d.id, "approve")}
                        className="flex items-center gap-1.5 bg-primary text-cream px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-primary-deep transition-colors"
                      >
                        <Check size={12} strokeWidth={2} />
                        Approve
                      </button>
                      <button
                        onClick={() => act(d.id, "reject")}
                        className="flex items-center gap-1.5 border border-line text-ink-soft px-3 py-1.5 text-xs uppercase tracking-wide hover:border-red-300 hover:text-red-600 transition-colors"
                      >
                        <X size={12} strokeWidth={2} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
