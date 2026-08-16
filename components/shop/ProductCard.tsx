"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { getProductImage } from "@/lib/product-image";
import { getSalePrice, isOnSale } from "@/lib/pricing";

export function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const salePrice = getSalePrice(product);
  const onSale = isOnSale(product);

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-[var(--radius)] border border-line overflow-hidden">
        <Image
          src={getProductImage(product)}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {onSale && (
          <span className="absolute top-4 left-4 bg-gold text-primary-deep text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-md border border-white/40">
            −{product.salePercent}%
          </span>
        )}
        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            setWishlisted((v) => !v);
          }}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
        >
          <Heart
            size={15}
            strokeWidth={1.6}
            className={wishlisted ? "fill-primary text-primary" : "text-ink"}
          />
        </button>
        <span className="absolute bottom-3 left-3 flex gap-1">
          {product.colors.slice(0, 4).map((c) => (
            <span
              key={c.name}
              className="h-3.5 w-3.5 rounded-full border border-white shadow-sm"
              style={{ background: c.hex }}
              title={c.name}
            />
          ))}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-ink font-medium text-sm">{product.name}</p>
        {onSale ? (
          <p className="text-base">
            <span className="text-primary font-bold">${salePrice?.toLocaleString()}</span>{" "}
            <span className="text-ink-soft/70 line-through text-sm">${product.price.toLocaleString()}</span>
          </p>
        ) : (
          <p className="text-ink-soft text-sm">${product.price.toLocaleString()}</p>
        )}
      </div>
    </Link>
  );
}
