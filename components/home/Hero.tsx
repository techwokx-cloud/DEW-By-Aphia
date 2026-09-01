"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { DewMotifCorner } from "@/components/ui/AnkaraMotif";

interface Slide {
  image: string;
  eyebrow: string;
  headline: [string, string];
  copy: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

const SLIDES: Slide[] = [
  {
    image: "/custom-orders/order-01.webp",
    eyebrow: "Premium African Fashion",
    headline: ["Bold Heritage.", "Timeless Elegance."],
    copy: "Exquisite Ghanaian wax prints & Ankara designs, crafted for the modern woman of class.",
    ctaLabel: "View LookBook",
    ctaHref: "/lookbook",
    secondaryLabel: "Book a Consultation",
    secondaryHref: "/custom-design#book",
  },
  {
    image: "/custom-orders/order-05.webp",
    eyebrow: "Tailored for the Boardroom",
    headline: ["Power Dressing,", "Reimagined."],
    copy: "Structured silhouettes cut from Ankara — made to command a room without saying a word.",
    ctaLabel: "View LookBook",
    ctaHref: "/lookbook",
    secondaryLabel: "Book a Consultation",
    secondaryHref: "/custom-design#book",
  },
  {
    image: "/custom-orders/order-09.webp",
    eyebrow: "Bridal & Occasion",
    headline: ["Your Day,", "Your Heritage."],
    copy: "Bespoke bridal pieces that honor tradition while feeling entirely, unmistakably yours.",
    ctaLabel: "Book a Consultation",
    ctaHref: "/custom-design#book",
    secondaryLabel: "View Lookbook",
    secondaryHref: "/lookbook",
  },
  {
    image: "/custom-orders/order-25.webp",
    eyebrow: "After Dark",
    headline: ["Evening,", "Elevated."],
    copy: "Fluid lines and rich wax-print detail, designed for the moments worth dressing up for.",
    ctaLabel: "View LookBook",
    ctaHref: "/lookbook",
    secondaryLabel: "Book a Consultation",
    secondaryHref: "/custom-design#book",
  },
  {
    image: "/custom-orders/order-13.webp",
    eyebrow: "Made to Order",
    headline: ["Crafted for", "the Modern Woman."],
    copy: "Every piece is cut, fitted, and finished by hand — made to order, made for you.",
    ctaLabel: "Start Your Order",
    ctaHref: "/custom-design",
    secondaryLabel: "Book a Consultation",
    secondaryHref: "/custom-design#book",
  },
];

export function Hero() {
  const [active, setActive] = useState(0);
  const [customImages, setCustomImages] = useState<string[] | null>(null);

  useEffect(() => {
    // Admin-selected images override the default ones per slide, by
    // position — if fewer than SLIDES.length are set, the remaining
    // slides just keep their default image. Fails silently to defaults
    // on any error since this is decorative, not critical content.
    fetch("/api/hero-images")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.images) && d.images.length > 0) setCustomImages(d.images);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const slide = { ...SLIDES[active], image: customImages?.[active] || SLIDES[active].image };

  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="relative min-h-[560px] sm:min-h-[620px] lg:min-h-[680px]">
        <AnimatePresence mode="sync">
          <motion.div
            key={slide.image}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={`DEW by Aphia — ${slide.headline.join(" ")}`}
              fill
              priority={active === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Legibility scrim: darker at the left where text sits, lighter toward the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

        <DewMotifCorner className="absolute top-6 left-6 w-10 h-10 opacity-70 z-10" tone="gold" />
        <DewMotifCorner className="absolute bottom-6 right-6 w-10 h-10 opacity-70 rotate-180 z-10" tone="gold" />

        <div className="relative z-10 flex h-full min-h-[560px] sm:min-h-[620px] lg:min-h-[680px] items-center">
          <div className="px-6 sm:px-10 lg:px-16 max-w-2xl py-16 lg:py-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.headline.join(" ")}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <p className="eyebrow text-gold mb-5">{slide.eyebrow}</p>
                <h1 className="font-display text-[2.6rem] leading-[1.08] sm:text-6xl lg:text-[3.6rem] xl:text-[4.2rem] text-cream text-balance">
                  {slide.headline[0]}
                  <br />
                  {slide.headline[1]}
                </h1>
                <div className="w-14 h-px bg-gold mt-7 mb-6" />
                <p className="max-w-md text-cream/80 text-base leading-relaxed">{slide.copy}</p>
                <div className="flex flex-wrap gap-4 mt-9">
                  <Button href={slide.ctaHref}>{slide.ctaLabel}</Button>
                  <Button
                    href={slide.secondaryHref}
                    variant="outline"
                    className="!border-cream/40 !text-cream hover:!bg-cream hover:!text-ink"
                  >
                    {slide.secondaryLabel}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              aria-label={`Show slide ${i + 1}: ${s.headline.join(" ")}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-gold" : "w-1.5 bg-cream/40"
              }`}
            />
          ))}
        </div>
      </div>

      <TrustBadges />
    </section>
  );
}

function TrustBadges() {
  return (
    <div className="relative z-10 bg-white border-t border-b border-line">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-4">
        <Image
          src="/brand/top-info-bar.webp"
          alt="Premium Quality: finest fabrics, exquisite craftsmanship. Custom Made: personalized designs just for you. Worldwide Shipping: we deliver to your doorstep. Secure Deposit: pay a secure 50% deposit to begin."
          width={1049}
          height={375}
          sizes="(max-width: 1400px) 100vw, 1400px"
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  );
}
