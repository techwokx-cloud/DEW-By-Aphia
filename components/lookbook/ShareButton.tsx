"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: `DEW by Aphia — ${title}`, url });
        return;
      } catch {
        // user cancelled or share unsupported in this context — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — nothing more we can do silently
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share this spread"
      className="p-2 text-cream/70 hover:text-cream transition-colors"
    >
      {copied ? <Check size={18} strokeWidth={1.5} /> : <Share2 size={18} strokeWidth={1.5} />}
    </button>
  );
}
