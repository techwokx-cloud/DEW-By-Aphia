import { PRODUCTS } from "@/lib/products-data";
import type { Product } from "@/lib/types";

/**
 * Phase 1: mutates the same in-memory PRODUCTS array the storefront reads
 * from, so admin changes show up on /shop immediately. Resets on server
 * restart — swap for Supabase writes in Phase 2 without changing callers.
 */
export function listProducts(): Product[] {
  return PRODUCTS;
}

export function createProduct(input: Omit<Product, "id" | "createdAt">): Product {
  const product: Product = {
    ...input,
    id: `p${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  PRODUCTS.unshift(product);
  return product;
}

export function updateProduct(id: string, patch: Partial<Product>): Product | null {
  const index = PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1) return null;
  PRODUCTS[index] = { ...PRODUCTS[index], ...patch, id: PRODUCTS[index].id };
  return PRODUCTS[index];
}

export function deleteProduct(id: string): boolean {
  const index = PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1) return false;
  PRODUCTS.splice(index, 1);
  return true;
}
