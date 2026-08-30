/**
 * Generates an original AI image via fal.ai — used as an upgrade over the
 * plain SVG graphic card when no rotation-eligible photo is available.
 * Real API call; returns null (caller falls back to the SVG card) until a
 * key is set — in Settings (admin dashboard, includes a model picker) or
 * as FAL_KEY / FAL_API_KEY env vars.
 *
 * The model is configurable in Settings rather than hardcoded, since
 * fal.ai hosts many models (Flux, Seedream, Ideogram, Nano Banana, Qwen
 * Image, and others) and their exact endpoint slugs and input schemas
 * change over time — check https://fal.ai/models for the current slug of
 * whichever model you want to use. Defaults to fal-ai/flux/schnell, which
 * is fast, cheap, and stable.
 */
import { getFalApiKey, getFalImageModel } from "@/lib/store/settings";

export async function generateFalImage(prompt: string): Promise<string | null> {
  const apiKey = getFalApiKey();
  if (!apiKey) return null;

  const model = getFalImageModel();

  try {
    const res = await fetch(`https://fal.run/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: "square_hd",
        num_images: 1,
      }),
    });

    if (!res.ok) {
      console.error(`fal.ai image generation failed (model: ${model}):`, res.status, await res.text());
      return null;
    }

    const data = await res.json();
    // Most fal.ai image models return { images: [{ url }] }; a few return
    // a single { image: { url } } instead — handle both.
    return data.images?.[0]?.url ?? data.image?.url ?? null;
  } catch (err) {
    console.error("fal.ai request failed:", err);
    return null;
  }
}

export const falConfigured = () => Boolean(getFalApiKey());

const POSTER_STYLES = [
  "bold minimalist graphic design poster, large geometric color blocks, strong typography-inspired composition",
  "editorial fashion poster with African wax-print pattern motifs woven into an abstract graphic layout",
  "high-contrast modern poster design, clean negative space, gold and deep purple color palette",
  "textured collage-style poster combining fabric pattern swatches and bold graphic shapes",
];

/** Builds a poster-style, graphic-design prompt for fal.ai — deliberately
 * NOT photorealistic fashion photography. Diffusion models routinely
 * garble any text they attempt to render, so this asks for abstract
 * graphic-design backdrops (color, pattern, composition) rather than
 * legible text; actual headline/caption text still comes from
 * generateGraphicCard's SVG templates, which render text perfectly.
 * Rotates through a few distinct style directions so consecutive images
 * don't look identical. */
export function buildPosterPrompt(subject: string): string {
  const style = POSTER_STYLES[Math.floor(Math.random() * POSTER_STYLES.length)];
  return `${style}. Theme: ${subject}, luxury Ghanaian fashion brand DEW by Aphia. No readable text or words in the image — pure graphic design and color.`;
}
