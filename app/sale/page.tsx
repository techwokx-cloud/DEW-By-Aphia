import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products-data";
import { isOnSale } from "@/lib/pricing";
import { ProductCard } from "@/components/shop/ProductCard";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";

export const metadata: Metadata = {
  title: "Sale — DEW by Aphia | Luxury Ghanaian Fashion on Clearance",
  description:
    "Shop DEW by Aphia's clearance pieces — real discounts on made-to-order Ghanaian wax print and Ankara fashion. Ships to the USA, UK, Canada & Australia.",
};

export default function SalePage() {
  const saleItems = getAllProducts().filter(isOnSale);

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
      <div className="text-center max-w-lg mx-auto mb-12">
        <p className="eyebrow text-primary mb-3">Clearance</p>
        <h1 className="font-display text-4xl text-ink">Sale</h1>
        <DewMotifDivider className="w-24 h-3 mx-auto mt-5 mb-4" tone="gold" />
        <p className="text-ink-soft text-sm">
          Real discounts on pieces from past collections — same craftsmanship, made to order
          in your size, while they last.
        </p>
      </div>

      {saleItems.length === 0 ? (
        <p className="text-center text-ink-soft text-sm">Nothing on sale right now — check back soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {saleItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
