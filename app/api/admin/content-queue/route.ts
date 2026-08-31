import { NextRequest, NextResponse } from "next/server";
import { listContentPosts, addContentPost, nextContentType, type ContentPost } from "@/lib/store/content-queue";
import { getProductBySlug, getAllProducts } from "@/lib/products-data";
import { getProductImage } from "@/lib/product-image";
import { generateCaption } from "@/lib/ai/content-agent";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";
import { pickContentImage } from "@/lib/content-image";

export async function GET() {
  return NextResponse.json({ items: await listContentPosts() });
}

// Marketing agent: generate a draft Instagram post. Always lands as
// "draft" — never posts. See PATCH on /[id] for approval.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const productSlug = body.productSlug as string | undefined;
  const requestedType = body.contentType as ContentPost["contentType"] | undefined;

  const product = productSlug ? getProductBySlug(productSlug) : pickRandomFeatured();
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const contentType = requestedType ?? (await nextContentType());

  // Genuinely mixes real photos, AI poster graphics, and SVG text
  // graphics — see lib/content-image.ts for why this isn't a strict
  // fallback chain.
  const { image, imageSource } = await pickContentImage(product);

  const draft = await generateCaption(product, contentType);
  const post = await addContentPost({
    productId: product.id,
    productName: product.name,
    image,
    imageSource,
    contentType,
    caption: draft.caption,
    hashtags: draft.hashtags,
  });

  const notification = await notifyOwner(
    `New Instagram ${contentType} post draft ready for review: "${product.name}". Approve it in the DEW admin dashboard.`
  );

  return NextResponse.json({ item: post, source: draft.source, ownerNotified: notification.sent }, { status: 201 });
}

function pickRandomFeatured() {
  const products = getAllProducts();
  return products[Math.floor(Math.random() * products.length)];
}
