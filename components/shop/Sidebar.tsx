"use client";

import { CATEGORIES, SIZES, type ShopFilters } from "./types";

const SWATCHES: Record<string, string> = {
  Purple: "#4b1f6f",
  Gold: "#c8a14a",
  Emerald: "#1e6b4f",
  Indigo: "#2a3a8f",
  Terracotta: "#b1542f",
  Black: "#1f1f1f",
  Cream: "#f8f5f0",
};

type Props = {
  filters: ShopFilters;
  onChange: (next: Partial<ShopFilters>) => void;
  onReset: () => void;
};

export function ShopSidebar({ filters, onChange, onReset }: Props) {
  return (
    <aside className="space-y-9">
      <div>
        <h3 className="eyebrow text-ink mb-4">Categories</h3>
        <ul className="space-y-2.5">
          {CATEGORIES.map((c) => (
            <li key={c.value}>
              <button
                onClick={() => onChange({ category: c.value, page: 1 })}
                className={`text-sm transition-colors ${
                  filters.category === c.value
                    ? "text-primary font-medium"
                    : "text-ink-soft hover:text-primary"
                }`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="eyebrow text-ink mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ size: filters.size === s ? null : s, page: 1 })}
              className={`h-9 min-w-9 px-2 text-xs border transition-colors ${
                filters.size === s
                  ? "border-primary bg-primary text-cream"
                  : "border-line text-ink-soft hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="eyebrow text-ink mb-4">Color</h3>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(SWATCHES).map(([name, hex]) => (
            <button
              key={name}
              aria-label={name}
              onClick={() => onChange({ color: filters.color === name ? null : name, page: 1 })}
              className={`h-7 w-7 rounded-full border-2 transition-transform ${
                filters.color === name ? "border-primary scale-110" : "border-transparent"
              }`}
              style={{ background: hex, boxShadow: "0 0 0 1px rgba(0,0,0,0.1) inset" }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="eyebrow text-ink mb-4">Price</h3>
        <input
          type="range"
          min={40}
          max={1500}
          step={20}
          value={filters.maxPrice}
          onChange={(e) => onChange({ maxPrice: Number(e.target.value), page: 1 })}
          className="w-full accent-primary"
        />
        <p className="text-xs text-ink-soft mt-2">Up to ${filters.maxPrice.toLocaleString()}</p>
      </div>

      <button
        onClick={onReset}
        className="text-xs tracking-[0.08em] uppercase text-primary hover:text-gold transition-colors"
      >
        Clear all filters
      </button>
    </aside>
  );
}
