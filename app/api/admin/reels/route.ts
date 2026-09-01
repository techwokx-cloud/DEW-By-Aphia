import { NextRequest, NextResponse } from "next/server";
import { listReels, addReel } from "@/lib/store/reel-queue";
import { getAllProducts, getProductBySlug } from "@/lib/products-data";
import { generateReelScript } from "@/lib/ai/reel-script-agent";
import { pickNextMedia, markUsed } from "@/lib/store/media-library";
import { generateFalImage, buildPosterPrompt } from "@/lib/fal-client";
import { generateGraphicCard } from "@/lib/graphic-card";
import { submitReelRender, type ReelScene } from "@/lib/json2video-client";
import { generateImageToVideo } from "@/lib/fal-video-client";
import { getReelMotionMode } from "@/lib/store/settings";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";
import { getPublicSiteUrl } from "@/lib/site-url";

export async function GET() {
  return NextResponse.json({ items: await listReels() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const productSlug = body.productSlug as string | undefined;
  const product = productSlug ? getProductBySlug(productSlug) : pickRandom();
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const script = await generateReelScript(product);

  // Resolve one background image for the reel: prefer rotation-eligible
  // media, then an AI-generated image via fal.ai, then the branded SVG
  // card as a last resort.
  let imageUrl: string;
  const media = await pickNextMedia();
  if (media) {
    imageUrl = new URL(media.url, getPublicSiteUrl()).toString();
    await markUsed(media.id);
  } else {
    const falImage = await generateFalImage(
      buildPosterPrompt(`${product.name}, ${product.fabric}, ${product.category.replace("-", " ")}`)
    );
    if (falImage) {
      imageUrl = falImage;
    } else {
      const graphicPath = await generateGraphicCard(product.name, product.fabric);
      imageUrl = new URL(graphicPath, getPublicSiteUrl()).toString();
    }
  }

  const allText = [script.hook, ...script.beats.map((b) => b.text)];
  const scenes: ReelScene[] = allText.map((text, i) => ({
    imageUrl,
    text,
    // The voiceover is one sentence meant to be spoken once over the
    // reel, not per on-screen line — attach it to the first scene only,
    // and give that scene extra time so a ~10-word sentence isn't cut
    // short mid-speech (a typical spoken sentence this length runs
    // 3.5-5s, vs. the standard 2.5s beat duration).
    durationSeconds: i === 0 ? 4.5 : 2.5,
    ...(i === 0 ? { voiceoverLine: script.voiceoverLine } : {}),
  }));

  // Optional AI video generation (real cost, opt-in via Settings) — only
  // for the opening scene, since it's the longest/most important beat
  // and generating AI video for all 4 scenes would be slow and expensive.
  // Falls back to the free Ken Burns pan/zoom on any failure or timeout
  // rather than blocking reel creation.
  if (getReelMotionMode() === "ai-video") {
    const videoResult = await generateImageToVideo(
      imageUrl,
      `Subtle cinematic motion, fashion editorial mood, ${product.name}`
    );
    if (videoResult.ok && videoResult.videoUrl) {
      scenes[0].videoUrl = videoResult.videoUrl;
    } else {
      console.warn("AI video generation failed, falling back to pan/zoom:", videoResult.error);
    }
  }

  const render = await submitReelRender(scenes);

  const reel = await addReel({
    productName: product.name,
    script,
    videoUrl: null,
    renderProjectId: render.projectId ?? null,
    renderStatus: render.started ? "pending" : render.reason === "api_error" ? "failed" : "not_configured",
    renderError: render.errorDetail,
  });

  await notifyOwner(`New Reel script ready for review: "${product.name}". Check it in the DEW admin dashboard.`);

  return NextResponse.json({ item: reel }, { status: 201 });
}

function pickRandom() {
  const products = getAllProducts();
  return products[Math.floor(Math.random() * products.length)];
}
