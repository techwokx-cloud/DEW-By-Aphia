"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import type { ContentPost } from "@/lib/store/content-queue";

const STATUS_STYLE: Record<ContentPost["status"], string> = {
  draft: "bg-gold/10 text-primary",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-50 text-red-600",
  posted: "bg-primary/10 text-primary",
};

export default function AdminContentPage() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/content-queue")
      .then((r) => r.json())
      .then((d) => setPosts(d.items ?? []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generateDraft() {
    setGenerating(true);
    await fetch("/api/admin/content-queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    setGenerating(false);
    load();
  }

  async function act(id: string, action: "approve" | "reject") {
    const res = await fetch(`/api/admin/content-queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    load();

    if (action === "reject") return;

    const sent = [
      data.instagram?.sent && "Instagram",
      data.facebook?.sent && "Facebook",
      data.threads?.sent && "Threads",
    ].filter(Boolean);

    if (sent.length > 0) {
      alert(`Posted to ${sent.join(", ")}!`);
    } else {
      alert(
        "Approved, but nothing posted yet — none of Instagram, Facebook, or Threads are connected. Set their credentials in Settings, and this post is saved and ready to go out the moment one is."
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Content Queue</h1>
          <p className="text-ink-soft text-sm">Marketing agent drafts — every post needs your approval before it can go out</p>
        </div>
        <button
          onClick={generateDraft}
          disabled={generating}
          className="flex items-center gap-2 bg-primary text-cream px-5 py-2.5 text-sm tracking-[0.05em] uppercase hover:bg-primary-deep transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} strokeWidth={2} />}
          Generate Draft
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-ink-soft text-sm">No drafts yet — click &ldquo;Generate Draft&rdquo; to have the agent write one.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <div key={post.id} className="border border-line rounded-[var(--radius)] bg-white overflow-hidden">
              <div className="relative aspect-square bg-primary/5">
                {post.image.endsWith(".svg") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image} alt={post.productName ?? "Post"} className="h-full w-full object-cover" />
                ) : (
                  <Image src={post.image} alt={post.productName ?? "Post"} fill className="object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className={`inline-block text-[10px] uppercase tracking-wide px-2 py-1 rounded-full ${STATUS_STYLE[post.status]}`}>
                    {post.status}
                  </span>
                  <span className="inline-block text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {post.contentType}
                  </span>
                  {post.imageSource === "generated-graphic" && (
                    <span className="inline-block text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-ink-soft/10 text-ink-soft">
                      generated graphic
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink leading-snug mb-2">{post.caption}</p>
                <p className="text-xs text-primary/70">{post.hashtags.map((h) => `#${h}`).join(" ")}</p>
                {post.status === "draft" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => act(post.id, "approve")}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-cream py-2 text-xs uppercase tracking-wide hover:bg-primary-deep transition-colors"
                    >
                      <Check size={13} strokeWidth={2} />
                      Approve
                    </button>
                    <button
                      onClick={() => act(post.id, "reject")}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-line text-ink-soft py-2 text-xs uppercase tracking-wide hover:border-red-300 hover:text-red-600 transition-colors"
                    >
                      <X size={13} strokeWidth={2} />
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
