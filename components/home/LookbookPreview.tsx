import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";
import { Reveal } from "@/components/ui/Reveal";
import { LOOKBOOK_SPREADS } from "@/lib/lookbook-data";

const spreads = [LOOKBOOK_SPREADS[0], LOOKBOOK_SPREADS[2], LOOKBOOK_SPREADS[4]];

export function LookbookPreview() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-28">
      <Reveal className="flex items-end justify-between mb-10">
        <div>
          <p className="eyebrow text-primary mb-3">Editorial</p>
          <h2 className="font-display text-3xl lg:text-4xl text-ink">From the Lookbook</h2>
          <DewMotifDivider className="w-28 h-3 mt-4" tone="gold" />
        </div>
        <Link
          href="/lookbook"
          className="hidden sm:flex items-center gap-1 text-sm tracking-wide text-primary hover:text-gold transition-colors"
        >
          Full lookbook <ArrowUpRight size={15} />
        </Link>
      </Reveal>

      <Reveal delay={0.1} className="grid sm:grid-cols-2 gap-5">
        <Link
          href="/lookbook"
          className="group relative rounded-[var(--radius)] overflow-hidden aspect-[4/5] sm:row-span-2 sm:aspect-auto"
        >
          <Image
            src={spreads[0].image}
            alt={spreads[0].title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/0" />
          <div className="absolute inset-0 flex flex-col justify-end p-7">
            <p className="eyebrow text-gold-soft mb-2">{spreads[0].season}</p>
            <h3 className="font-display text-2xl text-cream">{spreads[0].title}</h3>
          </div>
        </Link>
        {spreads.slice(1).map((s) => (
          <Link
            key={s.title}
            href="/lookbook"
            className="group relative rounded-[var(--radius)] overflow-hidden aspect-[4/3]"
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/0" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="eyebrow text-gold-soft mb-1">{s.season}</p>
              <h3 className="font-display text-xl text-cream">{s.title}</h3>
            </div>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}
