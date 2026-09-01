import { NextResponse } from "next/server";
import { getHeroImages } from "@/lib/store/settings";

// Public — no admin auth. Only exposes chosen image URLs, nothing
// sensitive, so the homepage (a public page) can read it directly.
export async function GET() {
  return NextResponse.json({ images: getHeroImages() });
}
