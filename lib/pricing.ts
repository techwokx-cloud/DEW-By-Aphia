import type { Product } from "./types";

export function getSalePrice(product: Pick<Product, "price" | "salePercent">): number | null {
  if (!product.salePercent) return null;
  return Math.round(product.price * (1 - product.salePercent / 100));
}

export function isOnSale(product: Pick<Product, "salePercent">): boolean {
  return Boolean(product.salePercent && product.salePercent > 0);
}
