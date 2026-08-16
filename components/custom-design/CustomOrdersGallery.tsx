"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { CUSTOM_ORDER_PHOTOS } from "@/lib/custom-orders-data";

export function CustomOrdersGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-20">
      <div className="text-center max-w-lg mx-auto mb-10">
        <p className="eyebrow text-primary mb-3">Real Client Orders</p>
        <h2 className="font-display text-3xl text-ink">From Our Custom Order Archive</h2>
        <p className="text-ink-soft text-sm mt-3">
          A look at pieces we&rsquo;ve made for real clients — every one made to order, start
          to finish, in our Accra atelier.
        </p>
      </div>

      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
        {CUSTOM_ORDER_PHOTOS.map((src, i) => (
          <button
            key={src}
            onClick={() => setActiveIndex(i)}
            className="group relative mb-3 w-full block break-inside-avoid rounded-md overflow-hidden"
          >
            <Image
              src={src}
              alt={`Custom DEW by Aphia order, photo ${i + 1}`}
              width={400}
              height={500}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Expand size={16} className="text-white" strokeWidth={1.75} />
            </span>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <Lightbox
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={(i) => setActiveIndex(i)}
        />
      )}
    </section>
  );
}

function Lightbox({
  index,
  onClose,
  onNavigate,
}: {
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const total = CUSTOM_ORDER_PHOTOS.length;
  return (
    <div className="fixed inset-0 z-[60] bg-ink/95 flex items-center justify-center px-6">
      <button onClick={onClose} aria-label="Close" className="absolute top-5 right-5 text-cream p-2">
        <X size={22} strokeWidth={1.5} />
      </button>
      <button
        onClick={() => onNavigate((index - 1 + total) % total)}
        aria-label="Previous"
        className="absolute left-3 sm:left-8 text-cream/70 hover:text-cream p-2"
      >
        <ChevronLeft size={28} strokeWidth={1.5} />
      </button>
      <div className="relative w-full max-w-md aspect-[4/5]">
        <Image
          src={CUSTOM_ORDER_PHOTOS[index]}
          alt={`Custom DEW by Aphia order, photo ${index + 1}`}
          fill
          sizes="90vw"
          className="object-contain"
        />
      </div>
      <button
        onClick={() => onNavigate((index + 1) % total)}
        aria-label="Next"
        className="absolute right-3 sm:right-8 text-cream/70 hover:text-cream p-2"
      >
        <ChevronRight size={28} strokeWidth={1.5} />
      </button>
    </div>
  );
}
