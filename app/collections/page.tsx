"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { COLLECTIONS } from "@/lib/collections-data";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";

const TABS = [{ label: "All", value: "all" as const }, ...COLLECTIONS.map((c) => ({ label: c.name, value: c.slug }))];

export default function CollectionsPage() {
  const [active, setActive] = useState<string>("all");
  const visible = active === "all" ? COLLECTIONS : COLLECTIONS.filter((c) => c.slug === active);

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
      <p className="eyebrow text-ink-soft mb-2">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        / <span className="text-ink">Collections</span>
      </p>
      <h1 className="font-display text-4xl text-ink mb-3">Collections</h1>
      <DewMotifDivider className="w-24 h-3 mb-8" tone="gold" />

      <div className="flex flex-wrap gap-3 mb-10">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={`text-xs tracking-[0.08em] uppercase px-4 py-2.5 border transition-colors ${
              active === tab.value
                ? "border-primary bg-primary text-cream"
                : "border-line text-ink-soft hover:border-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className="group relative aspect-[3/4] rounded-[var(--radius)] overflow-hidden block"
          >
            <Image
              src={c.images[0]}
              alt={c.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/0" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h3 className="font-display text-2xl text-cream mb-1">{c.name}</h3>
              <p className="text-cream/80 text-sm mb-4">{c.tagline}</p>
              <span className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-gold-soft w-fit">
                Shop Now
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
