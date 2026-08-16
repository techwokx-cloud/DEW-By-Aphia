"use client";

import { SlidersHorizontal } from "lucide-react";
import type { ShopFilters } from "./types";

type Props = {
  total: number;
  filters: ShopFilters;
  onChange: (next: Partial<ShopFilters>) => void;
  onOpenMobileFilters: () => void;
};

const SORT_OPTIONS: { label: string; value: ShopFilters["sort"] }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A–Z", value: "name-asc" },
];

export function ShopToolbar({ total, filters, onChange, onOpenMobileFilters }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-line">
      <button
        onClick={onOpenMobileFilters}
        className="lg:hidden flex items-center gap-2 text-sm text-ink-soft"
      >
        <SlidersHorizontal size={16} strokeWidth={1.5} />
        Filters
      </button>
      <p className="text-sm text-ink-soft hidden lg:block">
        Showing {total === 0 ? 0 : 1}-{total} of {total} results
      </p>
      <label className="flex items-center gap-2 text-sm ml-auto">
        <span className="text-ink-soft hidden sm:inline">Sort by</span>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as ShopFilters["sort"], page: 1 })}
          className="border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
