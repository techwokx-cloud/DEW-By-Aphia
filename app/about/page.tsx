import Image from "next/image";
import Link from "next/link";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";
import { Reveal } from "@/components/ui/Reveal";
import { BRAND_WATCHWORD, ADDRESS } from "@/lib/business-info";

const stats = [
  { value: "2014", label: "Established" },
  { value: "1K+", label: "Happy Clients" },
  { value: "50+", label: "Countries" },
  { value: "100%", label: "Passion" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
      <p className="eyebrow text-ink-soft mb-8">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        / <span className="text-ink">About Us</span>
      </p>

      <div className="grid lg:grid-cols-2 gap-14 items-center mb-20">
        <Reveal>
          <p className="eyebrow text-primary mb-4">About Us</p>
          <h1 className="font-display text-4xl lg:text-[3.2rem] leading-[1.1] text-ink text-balance mb-6">
            Our Story. Our Passion. Our Heritage.
          </h1>
          <DewMotifDivider className="w-28 h-3 mb-6" tone="gold" />
          <p className="text-ink-soft leading-relaxed mb-5 max-w-md">
            La Maison du Mode dew blends the rich heritage of African prints with
            contemporary design to create timeless pieces for women of class.
          </p>
          <p className="text-ink-soft leading-relaxed mb-8 max-w-md">
            Mixing prints since 2014, we celebrate culture, empower women and inspire
            confidence through fashion.
          </p>
          <p className="font-display italic text-lg text-primary mb-8 max-w-md">
            &ldquo;{BRAND_WATCHWORD}&rdquo;
          </p>
          <p className="font-display italic text-2xl text-primary">Aphia</p>
          <p className="eyebrow text-ink-soft mt-1">Founder &amp; Creative Director</p>
          <p className="text-ink-soft text-sm mt-6">
            Visit the atelier: <span className="text-ink">{ADDRESS}</span>
          </p>
        </Reveal>

        <Reveal delay={0.15} className="relative aspect-[4/5] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]">
          <Image
            src="/brand/founder-aphia.jpg"
            alt="Aphia — Founder & Creative Director of La Maison du Mode dew"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </Reveal>
      </div>

      <Reveal className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-line pt-12">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl lg:text-4xl text-primary mb-1">{s.value}</p>
            <p className="eyebrow text-ink-soft">{s.label}</p>
          </div>
        ))}
      </Reveal>
    </div>
  );
}
