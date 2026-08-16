"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { LookbookSpread } from "@/lib/lookbook-data";
import { ShareButton } from "./ShareButton";

type Props = {
  spreads: LookbookSpread[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function Fullscreen({ spreads, index, onClose, onNavigate }: Props) {
  const spread = spreads[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % spreads.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + spreads.length) % spreads.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, spreads.length, onClose, onNavigate]);

  if (!spread) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-ink/95 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 text-cream">
        <div>
          <p className="eyebrow text-gold-soft">{spread.season}</p>
          <p className="font-display text-lg">{spread.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <ShareButton title={spread.title} />
          <button onClick={onClose} aria-label="Close" className="p-2">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-10 relative">
        <button
          onClick={() => onNavigate((index - 1 + spreads.length) % spreads.length)}
          aria-label="Previous"
          className="absolute left-4 sm:left-8 p-2 text-cream/70 hover:text-cream"
        >
          <ChevronLeft size={28} strokeWidth={1.5} />
        </button>

        <div className="relative w-full max-w-2xl aspect-[4/5] rounded-[var(--radius)] overflow-hidden">
          <Image src={spread.image} alt={spread.title} fill sizes="90vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 flex items-end p-8">
            <p className="text-cream/90 text-sm max-w-sm">{spread.caption}</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate((index + 1) % spreads.length)}
          aria-label="Next"
          className="absolute right-4 sm:right-8 p-2 text-cream/70 hover:text-cream"
        >
          <ChevronRight size={28} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
