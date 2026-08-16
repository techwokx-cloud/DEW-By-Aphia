import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";
import { COLLECTIONS } from "@/lib/collections-data";
import { Reveal } from "@/components/ui/Reveal";

export function FeaturedCollections() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-28">
      <Reveal className="text-center max-w-xl mx-auto mb-12">
        <p className="inline-block eyebrow text-primary bg-primary/[0.06] px-4 py-1.5 rounded-full mb-4">
          Explore Our
        </p>
        <h2 className="font-display text-4xl lg:text-5xl text-ink">Collections</h2>
        <DewMotifDivider className="w-24 h-3 mx-auto mt-5" tone="gold" />
      </Reveal>

      <Reveal delay={0.1} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {COLLECTIONS.map((c) => (
          <Link
            href={`/shop?category=${c.slug}`}
            key={c.slug}
            className="group relative aspect-[3/4] rounded-[var(--radius)] overflow-hidden block"
          >
            <Image
              src={c.images[0]}
              alt={c.name}
              fill
              sizes="(max-width: 640px) 50vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/0" />
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <h3 className="font-display text-lg text-cream uppercase tracking-wide mb-1">
                {c.name}
              </h3>
              <p className="text-cream/75 text-xs leading-snug mb-3">{c.tagline}</p>
              <span className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-gold-soft">
                Shop Now
                <ArrowRight
                  size={13}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}
