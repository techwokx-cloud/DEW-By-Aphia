import type { CollectionSlug } from "@/lib/types";

export interface CollectionInfo {
  slug: CollectionSlug;
  name: string;
  tagline: string;
  images: [string, string];
}

// Uses real photography from the custom-order archive (public/custom-orders)
// instead of stock imagery — these are actual DEW by Aphia garments, not
// royalty-free placeholders. Reassign per-category as more photos come in
// via the admin Media Library / Products image upload.
export const COLLECTIONS: CollectionInfo[] = [
  {
    slug: "executive-wear",
    name: "Executive Wear",
    tagline: "Power. Presence. Purpose.",
    images: ["/custom-orders/order-01.webp", "/custom-orders/order-05.webp"],
  },
  {
    slug: "evening-wear",
    name: "Evening Wear",
    tagline: "Elegance for every special moment.",
    images: ["/custom-orders/order-09.webp", "/custom-orders/order-13.webp"],
  },
  {
    slug: "bridal",
    name: "Bridal",
    tagline: "Timeless beauty for your forever.",
    images: ["/custom-orders/order-17.webp", "/custom-orders/order-21.webp"],
  },
  {
    slug: "corporate-chic",
    name: "Corporate Chic",
    tagline: "Refined style for the modern career woman.",
    images: ["/custom-orders/order-25.webp", "/custom-orders/order-29.webp"],
  },
  {
    slug: "accessories",
    name: "Accessories",
    tagline: "The perfect finishing touch.",
    images: ["/custom-orders/order-33.webp", "/custom-orders/order-37.webp"],
  },
];

export const HERO_IMAGES = ["/custom-orders/order-03.webp", "/custom-orders/order-11.webp"];
