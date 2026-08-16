"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import type { Product, ProductQueryResult } from "@/lib/types";
import { ShopSidebar } from "@/components/shop/Sidebar";
import { ShopToolbar } from "@/components/shop/Toolbar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopPagination } from "@/components/shop/Pagination";
import { DEFAULT_FILTERS, type ShopFilters } from "@/components/shop/types";
import type { CollectionSlug } from "@/lib/types";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as CollectionSlug | null) ?? undefined;

  const [filters, setFilters] = useState<ShopFilters>({
    ...DEFAULT_FILTERS,
    category: initialCategory ?? DEFAULT_FILTERS.category,
  });
  const [result, setResult] = useState<ProductQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.size) params.set("size", filters.size);
    if (filters.color) params.set("color", filters.color);
    params.set("maxPrice", String(filters.maxPrice));
    params.set("sort", filters.sort);
    params.set("page", String(filters.page));
    params.set("pageSize", "6");

    fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: ProductQueryResult) => setResult(data))
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Failed to load products:", err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [filters]);

  const updateFilters = useCallback((next: Partial<ShopFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const products: Product[] = result?.items ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
      <div className="mb-10">
        <p className="eyebrow text-primary mb-2">Home / Shop</p>
        <h1 className="font-display text-4xl text-ink">Shop</h1>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-12">
        <div className="hidden lg:block">
          <ShopSidebar filters={filters} onChange={updateFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
        </div>

        <div>
          <ShopToolbar
            total={result?.total ?? 0}
            filters={filters}
            onChange={updateFilters}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          />
          <ProductGrid products={products} loading={loading} />
          {result && (
            <ShopPagination
              page={result.page}
              totalPages={result.totalPages}
              onChange={(page) => updateFilters({ page })}
            />
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-cream shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="eyebrow text-ink">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="p-2">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <ShopSidebar filters={filters} onChange={updateFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
          </div>
        </div>
      )}
    </div>
  );
}
