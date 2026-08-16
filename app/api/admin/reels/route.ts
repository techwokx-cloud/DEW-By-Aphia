import { NextRequest, NextResponse } from "next/server";
import { listReels, addReel } from "@/lib/store/reel-queue";
import { getAllProducts, getProductBySlug } from "@/lib/products-data";
import { generateReelScript } from "@/lib/ai/reel-script-agent";
import { pickNextMedia, markUsed } from "@/lib/store/media-library";
import { generateFalImage } from "@/lib/fal-client";
import { generateGraphicCard } from "@/lib/graphic-card";
import { submitReelRender, type ReelScene } from "@/lib/json2video-client";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";

export async function GET() {
  return NextResponse.json({ items: listReels() });
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
  const media = pickNextMedia();
  if (media) {
    imageUrl = new URL(media.url, request.nextUrl.origin).toString();
    markUsed(media.id);
  } else {
    const falImage = await generateFalImage(
      `Luxury African fashion editorial photo, ${product.fabric}, ${product.category.replace("-", " ")}, elegant, high-end, warm lighting`
    );
    if (falImage) {
      imageUrl = falImage;
    } else {
      const graphicPath = await generateGraphicCard(product.name, product.fabric);
      imageUrl = new URL(graphicPath, request.nextUrl.origin).toString();
    }
  }

  const allText = [script.hook, ...script.beats.map((b) => b.text)];
  const scenes: ReelScene[] = allText.map((text) => ({ imageUrl, text, durationSeconds: 2.5 }));

  const render = await submitReelRender(scenes);

  const reel = addReel({
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
