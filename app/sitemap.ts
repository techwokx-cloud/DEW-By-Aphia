import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products-data";
import { COLLECTIONS } from "@/lib/collections-data";

const BASE_URL = "https://dew-by-aphia.onrender.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/shop",
    "/collections",
    "/sale",
    "/custom-design",
    "/about",
    "/lookbook",
    "/ai",
    "/consultation",
    "/contact",
    "/faqs",
    "/shipping",
    "/returns",
    "/size-guide",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const productPages = getAllProducts().map((p) => ({
    url: `${BASE_URL}/shop/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const collectionPages = COLLECTIONS.map((c) => ({
    url: `${BASE_URL}/shop?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...collectionPages];
}
