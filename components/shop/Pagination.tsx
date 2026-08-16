"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export function ShopPagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-14">
      <button
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="h-9 w-9 flex items-center justify-center border border-line text-ink-soft hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-soft transition-colors"
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>
      {Array.from({ length: totalPages }).map((_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-9 w-9 flex items-center justify-center text-sm border transition-colors ${
              n === page
                ? "border-primary bg-primary text-cream"
                : "border-line text-ink-soft hover:border-primary hover:text-primary"
            }`}
          >
            {n}
          </button>
        );
      })}
      <button
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="h-9 w-9 flex items-center justify-center border border-line text-ink-soft hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-soft transition-colors"
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
