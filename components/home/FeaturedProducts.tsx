import { DewMotifDivider } from "@/components/ui/AnkaraMotif";
import { Reveal } from "@/components/ui/Reveal";
import { getAllProducts } from "@/lib/products-data";
import { ProductCard } from "@/components/shop/ProductCard";

const featured = getAllProducts()
  .filter((p) => p.featured)
  .sort((a, b) => (b.salePercent ?? 0) - (a.salePercent ?? 0))
  .slice(0, 4);

export function FeaturedProducts() {
  return (
    <section className="bg-primary/[0.03] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal className="text-center max-w-xl mx-auto mb-14">
          <p className="eyebrow text-primary mb-3">New This Season</p>
          <h2 className="font-display text-3xl lg:text-4xl text-ink">Featured Pieces</h2>
          <DewMotifDivider className="w-28 h-3 mx-auto mt-4" tone="gold" />
        </Reveal>

        <Reveal delay={0.1} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
