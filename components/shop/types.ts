import type { CollectionSlug } from "@/lib/types";

export interface ShopFilters {
  category: CollectionSlug | "all";
  size: string | null;
  color: string | null;
  maxPrice: number;
  sort: "newest" | "price-asc" | "price-desc" | "name-asc";
  page: number;
}

export const DEFAULT_FILTERS: ShopFilters = {
  category: "all",
  size: null,
  color: null,
  maxPrice: 1500,
  sort: "newest",
  page: 1,
};

export const CATEGORIES: { label: string; value: ShopFilters["category"] }[] = [
  { label: "All", value: "all" },
  { label: "Executive Wear", value: "executive-wear" },
  { label: "Evening Wear", value: "evening-wear" },
  { label: "Bridal", value: "bridal" },
  { label: "Corporate Chic", value: "corporate-chic" },
  { label: "Accessories", value: "accessories" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
