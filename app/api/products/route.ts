import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products-data";
import type { CollectionSlug, ProductQueryResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const category = params.get("category") as CollectionSlug | "all" | null;
  const size = params.get("size");
  const color = params.get("color");
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const sort = params.get("sort") ?? "newest";
  const page = Math.max(1, Number(params.get("page") ?? "1"));
  const pageSize = Math.min(24, Math.max(1, Number(params.get("pageSize") ?? "6")));

  let items = getAllProducts();

  if (category && category !== "all") {
    items = items.filter((p) => p.category === category);
  }
  if (size) {
    items = items.filter((p) => p.sizes.includes(size));
  }
  if (color) {
    items = items.filter((p) => p.colors.some((c) => c.name === color));
  }
  if (minPrice !== undefined) {
    items = items.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    items = items.filter((p) => p.price <= maxPrice);
  }

  switch (sort) {
    case "price-asc":
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items = [...items].sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
    default:
      items = [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  const result: ProductQueryResult = { items: paged, total, page, pageSize, totalPages };

  return NextResponse.json(result);
}
