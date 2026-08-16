export type CollectionSlug =
  | "executive-wear"
  | "evening-wear"
  | "bridal"
  | "corporate-chic"
  | "accessories";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CollectionSlug;
  price: number;
  /** Percent off, e.g. 20 for 20% off. Set to move overstock honestly —
   * never paired with fake countdown/scarcity messaging. */
  salePercent?: number;
  /** Real per-product photo, uploaded via admin. When unset, the product
   * falls back to a representative photo from its category (see
   * lib/product-image.ts) — upload one for full accuracy. */
  image?: string;
  fabric: string;
  description: string;
  sizes: string[];
  colors: ProductColor[];
  featured: boolean;
  createdAt: string; // ISO date, used for "Newest" sort
}

export interface ProductQuery {
  category?: CollectionSlug | "all";
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "name-asc";
  page?: number;
  pageSize?: number;
}

export interface ProductQueryResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
