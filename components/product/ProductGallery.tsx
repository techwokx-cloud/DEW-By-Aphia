"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { getProductImages } from "@/lib/product-image";

export function ProductGallery({ product }: { product: Product }) {
  const images = getProductImages(product);
  const [active, setActive] = useState(0);

  return (
    <div className="flex gap-4">
      <div className="hidden sm:flex flex-col gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            className={`relative h-20 w-16 rounded-md overflow-hidden border transition-colors ${
              active === i ? "border-primary" : "border-line"
            }`}
          >
            <Image src={src} alt={`${product.name} thumbnail ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative flex-1 aspect-[3/4] rounded-[var(--radius)] border border-line overflow-hidden">
        <Image
          src={images[active]}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
