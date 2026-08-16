import { NextRequest, NextResponse } from "next/server";
import { listProducts, createProduct } from "@/lib/store/products-store";

export async function GET() {
  return NextResponse.json({ items: listProducts() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.category || !body?.price) {
    return NextResponse.json({ error: "name, category, and price are required" }, { status: 400 });
  }
  const product = createProduct({
    slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: body.name,
    category: body.category,
    price: Number(body.price),
    salePercent: body.salePercent ? Number(body.salePercent) : undefined,
    image: body.image || undefined,
    fabric: body.fabric || "",
    description: body.description || "",
    sizes: body.sizes || ["XS", "S", "M", "L", "XL", "XXL"],
    colors: body.colors || [],
    featured: Boolean(body.featured),
  });
  return NextResponse.json({ item: product }, { status: 201 });
}
