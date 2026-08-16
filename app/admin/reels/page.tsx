"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Film, Sparkles, Check, X, Loader2 } from "lucide-react";
import type { ReelDraft } from "@/lib/store/reel-queue";

const STATUS_STYLE: Record<ReelDraft["status"], string> = {
  draft: "bg-gold/10 text-primary",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-50 text-red-600",
  posted: "bg-primary/10 text-primary",
};

export default function AdminReelsPage() {
  const [reels, setReels] = useState<ReelDraft[]>([]);
  const [generating, setGenerating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/reels").then((r) => r.json()).then((d) => setReels(d.items ?? []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll render status for anything still pending
  useEffect(() => {
    const pending = reels.filter((r) => r.renderStatus === "pending");
    if (pending.length === 0) return;

    pollRef.current = setInterval(() => {
      pending.forEach((r) => {
        fetch(`/api/admin/reels/${r.id}/status`)
          .then((res) => res.json())
          .then(() => load());
      });
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [reels, load]);

  async function generate() {
    setGenerating(true);
    await fetch("/api/admin/reels", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    setGenerating(false);
    load();
  }

  async function act(id: string, action: "approve" | "reject") {
    await fetch(`/api/admin/reels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
    if (action === "approve") {
      alert(
        "Approved. It won't post to Instagram yet — that needs IG_ACCESS_TOKEN and IG_BUSINESS_ACCOUNT_ID configured. The video is saved and ready once that's connected."
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-3xl text-ink">Reels</h1>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 bg-primary text-cream px-5 py-2.5 text-sm tracking-[0.05em] uppercase hover:bg-primary-deep transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} strokeWidth={2} />}
          Generate Reel
        </button>
      </div>
      <p className="text-ink-soft text-sm mb-8">
        AI writes the script, picks a background image, and (if json2video/fal.ai keys are
        set) renders an actual video — otherwise you get the script to film yourself.
      </p>

      {reels.length === 0 ? (
        <p className="text-ink-soft text-sm">No reels yet — click "Generate Reel" to have the agent write one.</p>
      ) : (
        <div className="space-y-5">
          {reels.map((reel) => (
            <div key={reel.id} className="border border-line rounded-[var(--radius)] bg-white p-5 grid sm:grid-cols-[200px_1fr] gap-5">
              <div className="aspect-[9/16] bg-primary/5 rounded-md overflow-hidden flex items-center justify-center">
                {reel.renderStatus === "ready" && reel.videoUrl ? (
                  <video src={reel.videoUrl} controls className="h-full w-full object-cover" />
                ) : reel.renderStatus === "pending" ? (
                  <div className="text-center px-3">
                    <Loader2 size={20} className="animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-[11px] text-ink-soft">Rendering...</p>
                  </div>
                ) : reel.renderStatus === "failed" ? (
                  <p className="text-[11px] text-red-500 text-center px-3">
                    Render failed{reel.renderError ? `: ${reel.renderError}` : ""}
                  </p>
                ) : (
                  <div className="text-center px-3">
                    <Film size={20} className="mx-auto mb-2 text-ink-soft" />
                    <p className="text-[11px] text-ink-soft">
                      No render — connect JSON2VIDEO_API_KEY to auto-render
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className={`inline-block text-[10px] uppercase tracking-wide px-2 py-1 rounded-full ${STATUS_STYLE[reel.status]}`}>
                    {reel.status}
                  </span>
                  <span className="inline-block text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-ink-soft/10 text-ink-soft">
                    {reel.productName}
                  </span>
                </div>
                <p className="font-medium text-ink text-sm mb-1">Hook: {reel.script.hook}</p>
                <ul className="text-xs text-ink-soft space-y-0.5 mb-2">
                  {reel.script.beats.map((b, i) => (
                    <li key={i}>• {b.text}</li>
                  ))}
                </ul>
                <p className="text-xs text-ink-soft italic mb-2">Voiceover: "{reel.script.voiceoverLine}"</p>
                <p className="text-sm text-ink mb-1">{reel.script.caption}</p>
                <p className="text-xs text-primary/70">{reel.script.hashtags.map((h) => `#${h}`).join(" ")}</p>

                {reel.status === "draft" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => act(reel.id, "approve")}
                      className="flex items-center gap-1.5 bg-primary text-cream px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-primary-deep transition-colors"
                    >
                      <Check size={12} strokeWidth={2} />
                      Approve
                    </button>
                    <button
                      onClick={() => act(reel.id, "reject")}
                      className="flex items-center gap-1.5 border border-line text-ink-soft px-3 py-1.5 text-xs uppercase tracking-wide hover:border-red-300 hover:text-red-600 transition-colors"
                    >
                      <X size={12} strokeWidth={2} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
