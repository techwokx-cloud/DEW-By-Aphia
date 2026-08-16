import type { Product } from "./types";
import { COLLECTIONS } from "./collections-data";

/**
 * Prefers a real per-product photo (product.image, set via the admin
 * Products upload) when one exists. Falls back to a representative photo
 * from the product's category — real DEW photography from the
 * custom-order archive, not stock imagery, but not guaranteed to be the
 * exact SKU pictured. Upload a real photo per product for full accuracy.
 */
export function getProductImage(product: Pick<Product, "category" | "id" | "image">, variant = 0): string {
  if (product.image) return product.image;
  const collection = COLLECTIONS.find((c) => c.slug === product.category);
  if (!collection) return "/custom-orders/order-01.webp";
  return collection.images[variant % collection.images.length];
}

export function getProductImages(product: Pick<Product, "category" | "id" | "image">): [string, string] {
  if (product.image) return [product.image, product.image];
  const collection = COLLECTIONS.find((c) => c.slug === product.category);
  return collection ? collection.images : ["/custom-orders/order-01.webp", "/custom-orders/order-02.webp"];
}
