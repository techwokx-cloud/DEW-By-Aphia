import type { Product } from "./types";

/**
 * Phase 1 data source: an in-memory catalog served through /api/products.
 * The API route contract (filter/sort/paginate params, response shape) is
 * designed to map directly onto a Supabase `products` table query in
 * Phase 2 — swap the functions below for Supabase calls without touching
 * the route handler's request/response shape.
 */
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const PALETTE: Record<string, string> = {
  Purple: "#4b1f6f",
  Gold: "#c8a14a",
  Emerald: "#1e6b4f",
  Indigo: "#2a3a8f",
  Terracotta: "#b1542f",
  Black: "#1f1f1f",
  Cream: "#f8f5f0",
};

function color(...names: string[]): Product["colors"] {
  return names.map((name) => ({ name, hex: PALETTE[name] }));
}

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "adjoa-tailored-coat",
    name: "Adjoa Tailored Coat",
    category: "executive-wear",
    price: 680,
    fabric: "Indigo Wax Print",
    description:
      "A structured single-breasted coat cut from indigo wax print, built for the boardroom and the runway between meetings.",
    sizes: SIZES,
    colors: color("Indigo", "Black"),
    featured: true,
    createdAt: "2026-06-01",
  },
  {
    id: "p2",
    salePercent: 20,
    slug: "royal-plume-blazer",
    name: "Royal Plume Blazer",
    category: "executive-wear",
    price: 520,
    fabric: "Purple & Gold Ankara",
    description: "Sharp-shouldered blazer in a bold purple and gold Ankara print, styled to lead a room.",
    sizes: SIZES,
    colors: color("Purple", "Gold"),
    featured: true,
    createdAt: "2026-05-20",
  },
  {
    id: "p3",
    slug: "nana-two-piece",
    name: "Nana Tailored Two-Piece",
    category: "corporate-chic",
    price: 540,
    fabric: "Emerald Wax Print",
    description: "A fitted two-piece set — cropped jacket and pencil skirt — in emerald wax print for the modern career woman.",
    sizes: SIZES,
    colors: color("Emerald", "Black"),
    featured: true,
    createdAt: "2026-05-15",
  },
  {
    id: "p4",
    slug: "akosua-wrap-dress",
    name: "Akosua Wrap Dress",
    category: "corporate-chic",
    price: 420,
    fabric: "Gold Ankara",
    description: "A flattering wrap silhouette in gold Ankara, easy enough for the office and sharp enough for after.",
    sizes: SIZES,
    colors: color("Gold", "Terracotta"),
    featured: false,
    createdAt: "2026-04-28",
  },
  {
    id: "p5",
    slug: "efua-bridal-gown",
    name: "Efua Bridal Gown",
    category: "bridal",
    price: 1240,
    fabric: "Ivory Wax Print & Lace",
    description: "A hand-finished bridal gown blending Ghanaian wax print detailing with classic ivory lace.",
    sizes: SIZES,
    colors: color("Cream", "Gold"),
    featured: true,
    createdAt: "2026-06-10",
  },
  {
    id: "p6",
    salePercent: 25,
    slug: "abena-bridal-two-piece",
    name: "Abena Bridal Two-Piece",
    category: "bridal",
    price: 980,
    fabric: "Ivory Wax Print",
    description: "A modern bridal separates set for the bride who wants two looks in one day.",
    sizes: SIZES,
    colors: color("Cream"),
    featured: true,
    createdAt: "2026-05-02",
  },
  {
    id: "p7",
    slug: "high-vision-pencil-skirt",
    name: "High Vision Pencil Skirt",
    category: "evening-wear",
    price: 380,
    fabric: "Purple Wax Print",
    description: "A high-waisted pencil skirt in deep purple wax print, cut for a statement silhouette.",
    sizes: SIZES,
    colors: color("Purple"),
    featured: false,
    createdAt: "2026-06-05",
  },
  {
    id: "p8",
    slug: "one-shoulder-gown",
    name: "One Shoulder Gown",
    category: "evening-wear",
    price: 620,
    fabric: "Gold Ankara",
    description: "A floor-length one-shoulder gown for the room you walk into last.",
    sizes: SIZES,
    colors: color("Gold", "Black"),
    featured: true,
    createdAt: "2026-06-12",
  },
  {
    id: "p9",
    salePercent: 15,
    slug: "wide-leg-jumpsuit",
    name: "Wide Leg Jumpsuit",
    category: "evening-wear",
    price: 460,
    fabric: "Terracotta Wax Print",
    description: "A wide-leg jumpsuit in warm terracotta wax print, for evenings that call for movement.",
    sizes: SIZES,
    colors: color("Terracotta"),
    featured: true,
    createdAt: "2026-03-18",
  },
  {
    id: "p10",
    slug: "ankara-power-clutch",
    name: "Ankara Power Clutch",
    category: "accessories",
    price: 95,
    fabric: "Mixed Wax Print",
    description: "A structured clutch in mixed wax print scraps — no two are exactly alike.",
    sizes: ["One Size"],
    colors: color("Purple", "Gold", "Emerald"),
    featured: false,
    createdAt: "2026-06-15",
  },
  {
    id: "p11",
    slug: "gele-headwrap-set",
    name: "Gele Headwrap Set",
    category: "accessories",
    price: 65,
    fabric: "Gold Ankara",
    description: "A pre-shaped gele headwrap set in gold Ankara, ready in minutes.",
    sizes: ["One Size"],
    colors: color("Gold", "Terracotta"),
    featured: true,
    createdAt: "2026-06-18",
  },
  {
    id: "p12",
    salePercent: 30,
    slug: "beaded-statement-earrings",
    name: "Beaded Statement Earrings",
    category: "accessories",
    price: 48,
    fabric: "Brass & Glass Bead",
    description: "Hand-strung statement earrings, the finishing touch for any DEW look.",
    sizes: ["One Size"],
    colors: color("Gold"),
    featured: true,
    createdAt: "2026-02-22",
  },
];

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getAllColorNames(): string[] {
  return Array.from(new Set(PRODUCTS.flatMap((p) => p.colors.map((c) => c.name))));
}
