"use client";

import { useEffect, useState, useCallback } from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import type { Lead } from "@/lib/store/leads";

const STATUS_OPTIONS: Lead["status"][] = ["new", "engaged", "qualified", "won", "lost"];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [simPlatform, setSimPlatform] = useState<"instagram" | "facebook">("instagram");
  const [simHandle, setSimHandle] = useState("");
  const [simText, setSimText] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [draftEdit, setDraftEdit] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((d) => {
        setLeads(d.items ?? []);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = leads.find((l) => l.id === activeId) ?? leads[0] ?? null;

  useEffect(() => {
    setDraftEdit(active?.draftReply ?? "");
  }, [active?.id, active?.draftReply]);

  async function simulateIncoming(e: React.FormEvent) {
    e.preventDefault();
    if (!simHandle.trim() || !simText.trim()) return;
    setSimulating(true);
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: simPlatform, handle: simHandle, text: simText }),
    });
    const data = await res.json();
    setSimulating(false);
    setSimText("");
    setActiveId(data.item?.id ?? null);
    load();
  }

  async function approveSend() {
    if (!active) return;
    setSending(true);
    await fetch(`/api/admin/leads/${active.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve-send", text: draftEdit }),
    });
    setSending(false);
    load();
  }

  async function changeStatus(status: Lead["status"]) {
    if (!active) return;
    await fetch(`/api/admin/leads/${active.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-status", status }),
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Leads</h1>
      <p className="text-ink-soft text-sm mb-6">
        Sales agent drafts replies from Instagram and Facebook DMs — nothing sends until you
        approve it below. (Threads has no public DM API, so it can't feed leads here — Threads
        stays a posting-only channel.)
      </p>

      <form onSubmit={simulateIncoming} className="border border-line rounded-[var(--radius)] bg-white p-4 mb-8 flex flex-wrap gap-3 items-end">
        <div className="min-w-[130px]">
          <label className="block text-xs text-ink-soft mb-1">Platform</label>
          <select
            value={simPlatform}
            onChange={(e) => setSimPlatform(e.target.value as "instagram" | "facebook")}
            className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-primary capitalize"
          >
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-ink-soft mb-1">Handle / PSID</label>
          <input
            value={simHandle}
            onChange={(e) => setSimHandle(e.target.value)}
            placeholder="@customer_handle"
            className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex-[2] min-w-[220px]">
          <label className="block text-xs text-ink-soft mb-1">Simulate incoming message</label>
          <input
            value={simText}
            onChange={(e) => setSimText(e.target.value)}
            placeholder="Hi, do you have this in a size 12?"
            className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={simulating}
          className="flex items-center gap-2 bg-primary text-cream px-4 py-2.5 text-xs uppercase tracking-wide hover:bg-primary-deep transition-colors disabled:opacity-50"
        >
          {simulating ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} strokeWidth={2} />}
          Send
        </button>
      </form>

      {leads.length === 0 ? (
        <p className="text-ink-soft text-sm">
          No leads yet. Once the Instagram and Facebook webhooks are connected, real DMs will
          appear here — for now, use &ldquo;Simulate incoming message&rdquo; above to test the
          sales agent.
        </p>
      ) : (
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <div className="border border-line rounded-[var(--radius)] bg-white overflow-hidden divide-y divide-line">
            {leads.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveId(l.id)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  active?.id === l.id ? "bg-primary/[0.06]" : "hover:bg-primary/[0.03]"
                }`}
              >
                <p className="text-ink font-medium">{l.handle}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  <span className="capitalize">{l.platform}</span> · <span className="capitalize">{l.status}</span>
                </p>
              </button>
            ))}
          </div>

          {active && (
            <div className="border border-line rounded-[var(--radius)] bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-ink">{active.handle}</p>
                  <p className="text-xs text-ink-soft capitalize">{active.platform}</p>
                </div>
                <select
                  value={active.status}
                  onChange={(e) => changeStatus(e.target.value as Lead["status"])}
                  className="text-xs border border-line px-2 py-1.5 outline-none capitalize"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                {active.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === "lead" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                        m.from === "lead" ? "bg-cream border border-line text-ink" : "bg-primary text-cream"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {active.draftReply !== null ? (
                <div className="border-t border-line pt-4">
                  <p className="text-xs uppercase tracking-wide text-ink-soft mb-2">Agent draft reply — edit before sending</p>
                  <textarea
                    value={draftEdit}
                    onChange={(e) => setDraftEdit(e.target.value)}
                    rows={3}
                    className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-primary resize-none mb-3"
                  />
                  <button
                    onClick={approveSend}
                    disabled={sending}
                    className="flex items-center gap-2 bg-primary text-cream px-4 py-2.5 text-xs uppercase tracking-wide hover:bg-primary-deep transition-colors disabled:opacity-50"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} strokeWidth={2} />}
                    Approve & Send
                  </button>
                </div>
              ) : (
                <p className="text-xs text-ink-soft border-t border-line pt-4">No pending draft for this conversation.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
