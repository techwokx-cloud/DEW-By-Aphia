"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { DewMotifCorner } from "@/components/ui/AnkaraMotif";

const ROTATION_IMAGES = [
  "/collections/hero-1.avif",
  "/collections/executive-1.avif",
  "/collections/bridal-1.avif",
  "/collections/evening-1.avif",
  "/collections/hero-2.avif",
];

export function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % ROTATION_IMAGES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="grid lg:grid-cols-2 min-h-[560px] lg:min-h-[620px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-16 lg:py-0"
        >
          <p className="eyebrow text-gold mb-5">Premium African Fashion</p>
          <h1 className="font-display text-[2.6rem] leading-[1.08] sm:text-6xl lg:text-[3.6rem] xl:text-[4.2rem] text-cream text-balance">
            Bold Heritage.
            <br />
            Timeless Elegance.
          </h1>
          <div className="w-14 h-px bg-gold mt-7 mb-6" />
          <p className="max-w-md text-cream/70 text-base leading-relaxed">
            Exquisite Ghanaian wax prints &amp; Ankara designs, crafted for the modern
            woman of class.
          </p>
          <div className="flex flex-wrap gap-4 mt-9">
            <Button href="/collections">Shop Collections</Button>
            <Button
              href="/consultation"
              variant="outline"
              className="!border-cream/40 !text-cream hover:!bg-cream hover:!text-ink"
            >
              Book a Consultation
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative min-h-[320px] lg:min-h-0 overflow-hidden"
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={ROTATION_IMAGES[active]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={ROTATION_IMAGES[active]}
                alt="DEW by Aphia — bold heritage, timeless elegance"
                fill
                priority={active === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-primary-deep/10" />
          <DewMotifCorner className="absolute top-6 left-6 w-10 h-10 opacity-70" tone="gold" />
          <DewMotifCorner className="absolute bottom-6 right-6 w-10 h-10 opacity-70 rotate-180" tone="gold" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {ROTATION_IMAGES.map((img, i) => (
              <button
                key={img}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-gold" : "w-1.5 bg-cream/40"
                }`}
              />
            ))}
          </div>
        </motion.div>
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
          alt="Premium Quality: finest fabrics, exquisite craftsmanship. Custom Made: personalized designs just for you. Worldwide Shipping: we deliver to your doorstep. Secure Payments: safe & secure checkout experience."
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
