import { NextRequest, NextResponse } from "next/server";
import { getUpcomingOccasions, GHANA_OCCASIONS } from "@/lib/ghana-holidays";
import { getAllProducts } from "@/lib/products-data";
import { getProductImage } from "@/lib/product-image";
import { generateOccasionCaption } from "@/lib/ai/content-agent";
import { addContentPost } from "@/lib/store/content-queue";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";

export async function GET() {
  return NextResponse.json({ items: getUpcomingOccasions(30) });
}

// "Yes" path of the promo prompt: generate occasion-tied content for a
// featured product and queue it for approval, same as any other draft.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const occasionId = body.occasionId as string;
  const occasion = GHANA_OCCASIONS.find((o) => o.id === occasionId);
  if (!occasion) return NextResponse.json({ error: "Unknown occasion" }, { status: 404 });

  const products = getAllProducts().filter((p) => p.featured);
  const product = products[Math.floor(Math.random() * products.length)] ?? getAllProducts()[0];

  const draft = await generateOccasionCaption(product, occasion.name, occasion.note);
  const post = addContentPost({
    productId: product.id,
    productName: product.name,
    image: getProductImage(product),
    imageSource: "product-photo",
    contentType: "promo",
    caption: draft.caption,
    hashtags: draft.hashtags,
  });

  await notifyOwner(`Promo draft ready for ${occasion.name}: "${product.name}". Approve it in the DEW admin dashboard.`);

  return NextResponse.json({ item: post, source: draft.source }, { status: 201 });
}
