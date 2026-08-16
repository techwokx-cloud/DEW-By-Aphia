"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { LOOKBOOK_SPREADS, SEASONS, type LookbookSpread } from "@/lib/lookbook-data";
import { CATEGORIES } from "@/components/shop/types";
import { Fullscreen } from "./Fullscreen";

export function LookbookGallery() {
  const [season, setSeason] = useState<(typeof SEASONS)[number]>("All");
  const [category, setCategory] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return LOOKBOOK_SPREADS.filter((s) => {
      const seasonMatch = season === "All" || s.season === season;
      const categoryMatch = category === "all" || s.category === category;
      return seasonMatch && categoryMatch;
    });
  }, [season, category]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pb-24">
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {SEASONS.map((s) => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className={`text-xs tracking-[0.08em] uppercase px-4 py-2 border transition-colors ${
              season === s ? "border-primary bg-primary text-cream" : "border-line text-ink-soft hover:border-primary"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="hairline w-8 opacity-40 hidden sm:block" />
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`text-xs tracking-[0.08em] uppercase px-4 py-2 border transition-colors ${
              category === c.value ? "border-gold bg-gold/10 text-primary" : "border-line text-ink-soft hover:border-gold"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-ink-soft py-16">No spreads match those filters yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((spread, i) => (
            <SpreadCard key={spread.id} spread={spread} onOpen={() => setActiveIndex(i)} />
          ))}
        </div>
      )}

      {activeIndex !== null && (
        <Fullscreen
          spreads={filtered}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={(i) => setActiveIndex(i)}
        />
      )}
    </div>
  );
}

function SpreadCard({ spread, onOpen }: { spread: LookbookSpread; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group relative aspect-[4/5] rounded-[var(--radius)] overflow-hidden text-left block"
    >
      <Image
        src={spread.image}
        alt={spread.title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />
      <span className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Expand size={15} className="text-cream" strokeWidth={1.6} />
      </span>
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <p className="eyebrow text-gold-soft mb-1">{spread.season}</p>
        <h3 className="font-display text-xl text-cream mb-1">{spread.title}</h3>
        <p className="text-cream/70 text-xs leading-snug">{spread.caption}</p>
      </div>
    </button>
  );
}
