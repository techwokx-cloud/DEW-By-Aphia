import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Gem, Truck, ShieldCheck, Ruler } from "lucide-react";
import { getAllProducts, getProductBySlug } from "@/lib/products-data";
import { getSalePrice } from "@/lib/pricing";
import { getProductImage } from "@/lib/product-image";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPanel } from "@/components/product/ProductPanel";
import { ProductCard } from "@/components/shop/ProductCard";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  const price = getSalePrice(product) ?? product.price;
  const title = `${product.name} — $${price}`;
  const description = `${product.description} Made to order in your size, ${product.fabric}. Ships worldwide including the USA, UK, Canada & Australia.`;

  return {
    title,
    description,
    openGraph: { title, description, images: [getProductImage(product)] },
    twitter: { card: "summary_large_image", title, description, images: [getProductImage(product)] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getAllProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const effectivePrice = getSalePrice(product) ?? product.price;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `https://dew-by-aphia.onrender.com${getProductImage(product)}`,
    brand: { "@type": "Brand", name: "DEW by Aphia" },
    offers: {
      "@type": "Offer",
      price: effectivePrice,
      priceCurrency: "USD",
      availability: "https://schema.org/MadeToOrder",
      url: `https://dew-by-aphia.onrender.com/shop/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="eyebrow text-ink-soft mb-8">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>{" "}
        / <span className="text-ink">{product.name}</span>
      </p>

      <div className="grid lg:grid-cols-2 gap-14">
        <ProductGallery product={product} />
        <ProductPanel product={product} />
      </div>

      <div className="grid sm:grid-cols-4 gap-6 mt-16 pt-10 border-t border-line text-center sm:text-left">
        {[
          { icon: Gem, label: "Premium Quality", desc: "Finest fabrics, exquisite craftsmanship" },
          { icon: Truck, label: "Worldwide Shipping", desc: "USA, UK, Canada & Australia" },
          { icon: ShieldCheck, label: "Secure Payments", desc: "Safe & secure checkout" },
          { icon: Ruler, label: "Made to Order", desc: "Custom pieces just for you" },
        ].map((b) => (
          <div key={b.label} className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <b.icon size={16} strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{b.label}</p>
              <p className="text-xs text-ink-soft">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl text-ink mb-8">You May Also Like</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
