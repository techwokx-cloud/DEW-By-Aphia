import { pickNextMedia, markUsed } from "@/lib/store/media-library";
import { generateFalImage, buildPosterPrompt } from "@/lib/fal-client";
import { generateGraphicCard } from "@/lib/graphic-card";
import type { ContentPost } from "@/lib/store/content-queue";
import type { Product } from "@/lib/types";

export interface ContentImageResult {
  image: string;
  imageSource: ContentPost["imageSource"];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks the image for a generated post/ad, genuinely mixing three source
 * types instead of a strict priority fallback — a strict "prefer real
 * photos, only fall back if empty" chain means every post uses real
 * photos as long as any exist, and the poster/graphic styles never get
 * used at all. Instead, this shuffles the three source types each call
 * and tries them in that random order, falling through only when a
 * source genuinely isn't available (no eligible photo, no fal.ai key,
 * etc.) — so over a run of posts, all three styles actually show up.
 */
export async function pickContentImage(product: Product): Promise<ContentImageResult> {
  const order = shuffle<"media-library" | "ai-generated" | "generated-graphic">([
    "media-library",
    "ai-generated",
    "generated-graphic",
  ]);

  for (const source of order) {
    if (source === "media-library") {
      const media = await pickNextMedia();
      if (media) {
        await markUsed(media.id);
        return { image: media.url, imageSource: "media-library" };
      }
    }

    if (source === "ai-generated") {
      const falImage = await generateFalImage(
        buildPosterPrompt(`${product.name}, ${product.fabric}, ${product.category.replace("-", " ")}`)
      );
      if (falImage) {
        return { image: falImage, imageSource: "ai-generated" };
      }
    }

    if (source === "generated-graphic") {
      // The one source that can never fail (no external dependency) —
      // if the shuffle lands here or everything else was unavailable,
      // this always produces something.
      const graphicPath = await generateGraphicCard(product.name, product.fabric);
      return { image: graphicPath, imageSource: "generated-graphic" };
    }
  }

  // Unreachable in practice (generated-graphic always succeeds and is
  // always in `order`), but keeps the return type honest.
  const graphicPath = await generateGraphicCard(product.name, product.fabric);
  return { image: graphicPath, imageSource: "generated-graphic" };
}
