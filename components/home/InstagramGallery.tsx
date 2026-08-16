import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { COLLECTIONS, HERO_IMAGES } from "@/lib/collections-data";

const tiles = [
  HERO_IMAGES[0],
  COLLECTIONS[0].images[0],
  COLLECTIONS[2].images[0],
  COLLECTIONS[1].images[1],
  COLLECTIONS[3].images[0],
  HERO_IMAGES[1],
];

export function InstagramGallery() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-28">
      <Reveal className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Image src="/brand/instagram-icon.png" alt="" width={16} height={16} className="h-4 w-4" />
          <p className="eyebrow text-primary">@dew_byaphia</p>
        </div>
        <h2 className="font-display text-3xl lg:text-4xl text-ink">Styled by Our Community</h2>
      </Reveal>

      <Reveal delay={0.1} className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {tiles.map((src, i) => (
          <a
            key={i}
            href="https://www.instagram.com/dew_byaphia/"
            target="_blank"
            rel="noreferrer"
            className="relative aspect-square rounded-sm overflow-hidden block transition-transform duration-300 hover:scale-[0.97]"
            aria-label="View on Instagram"
          >
            <Image src={src} alt="DEW by Aphia on Instagram" fill sizes="16vw" className="object-cover" />
          </a>
        ))}
      </Reveal>
    </section>
  );
}
