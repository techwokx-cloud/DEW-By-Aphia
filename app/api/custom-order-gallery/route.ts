import { NextResponse } from "next/server";
import { getCustomOrderGalleryImages } from "@/lib/store/settings";
import { CUSTOM_ORDER_PHOTOS } from "@/lib/custom-orders-data";

// Public — no admin auth. Serves the admin-curated gallery override if
// one's been set (Settings -> Bespoke Order Gallery); otherwise falls
// back to the full built-in photo archive so the gallery is never empty.
export async function GET() {
  const override = getCustomOrderGalleryImages();
  return NextResponse.json({ images: override.length > 0 ? override : CUSTOM_ORDER_PHOTOS });
}
