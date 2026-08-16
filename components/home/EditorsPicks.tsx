import Image from "next/image";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";
import { Reveal } from "@/components/ui/Reveal";
import { getProductImage } from "@/lib/product-image";
import type { CollectionSlug } from "@/lib/types";

const picks: { name: string; fabric: string; price: string; category: CollectionSlug }[] = [
  { name: "The Adjoa Coat", fabric: "Indigo Wax Print", price: "$680", category: "executive-wear" },
  { name: "Akosua Wrap Dress", fabric: "Gold Ankara", price: "$420", category: "corporate-chic" },
  { name: "Nana Tailored Two-Piece", fabric: "Emerald Wax Print", price: "$540", category: "corporate-chic" },
];

export function EditorsPicks() {
  return (
    <section className="bg-primary/[0.03] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal className="text-center max-w-xl mx-auto mb-14">
          <p className="eyebrow text-primary mb-3">Curated by the Atelier</p>
          <h2 className="font-display text-3xl lg:text-4xl text-ink">Editor&rsquo;s Picks</h2>
          <DewMotifDivider className="w-28 h-3 mx-auto mt-4" tone="gold" />
        </Reveal>

        <Reveal delay={0.1} className="grid sm:grid-cols-3 gap-8">
          {picks.map((p, i) => (
            <div key={p.name} className="group">
              <div className="relative aspect-[4/5] rounded-[var(--radius)] border border-line overflow-hidden">
                <Image
                  src={getProductImage({ category: p.category, id: p.name }, i)}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg text-ink">{p.name}</h3>
                  <p className="text-sm text-ink-soft">{p.fabric}</p>
                </div>
                <span className="text-sm text-primary font-medium">{p.price}</span>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
