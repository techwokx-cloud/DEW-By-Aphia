import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] rounded-[var(--radius)] bg-line/60" />
            <div className="mt-3 h-3.5 w-3/4 rounded bg-line/60" />
            <div className="mt-2 h-3.5 w-1/4 rounded bg-line/60" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-xl text-ink mb-2">No pieces match those filters</p>
        <p className="text-ink-soft text-sm">Try widening your price range or clearing a filter.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
