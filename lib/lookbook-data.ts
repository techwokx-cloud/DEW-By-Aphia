import type { CollectionSlug } from "@/lib/types";

export interface LookbookSpread {
  id: string;
  title: string;
  season: "SS26" | "AW25";
  category: CollectionSlug;
  caption: string;
  image: string;
}

export const LOOKBOOK_SPREADS: LookbookSpread[] = [
  { id: "l1", title: "The Executive Ankara", season: "SS26", category: "executive-wear", caption: "Corporate coats reworked in indigo and gold wax print.", image: "/collections/executive-1.avif" },
  { id: "l2", title: "Boardroom Power", season: "SS26", category: "executive-wear", caption: "Sharp tailoring for the woman who leads the meeting.", image: "/collections/executive-2.avif" },
  { id: "l3", title: "Bridal Editorial", season: "SS26", category: "bridal", caption: "Ivory wax print meets classic lace for the modern bride.", image: "/collections/bridal-1.avif" },
  { id: "l4", title: "Aisle & After", season: "SS26", category: "bridal", caption: "Two looks, one unforgettable day.", image: "/collections/bridal-2.avif" },
  { id: "l5", title: "Corporate Luxe", season: "AW25", category: "corporate-chic", caption: "Refined separates for the nine-to-nine.", image: "/collections/corporate-chic-1.avif" },
  { id: "l6", title: "After Five", season: "AW25", category: "corporate-chic", caption: "Desk to dinner without changing your energy.", image: "/collections/corporate-chic-2.avif" },
  { id: "l7", title: "Golden Hour Gala", season: "SS26", category: "evening-wear", caption: "Statement silhouettes for the room you walk into last.", image: "/collections/evening-1.avif" },
  { id: "l8", title: "Midnight Print", season: "AW25", category: "evening-wear", caption: "Deep jewel tones for evenings that run late.", image: "/collections/evening-2.avif" },
  { id: "l9", title: "Finishing Touches", season: "SS26", category: "accessories", caption: "The details that carry the print through the whole look.", image: "/collections/accessories-1.avif" },
];

export const SEASONS = ["All", "SS26", "AW25"] as const;
