import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store/settings";
import { isDue, markGenerated } from "@/lib/store/content-schedule";
import { addContentPost, nextContentType } from "@/lib/store/content-queue";
import { getAllProducts } from "@/lib/products-data";
import { generateCaption } from "@/lib/ai/content-agent";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";
import { pickNextMedia, markUsed } from "@/lib/store/media-library";
import { generateGraphicCard } from "@/lib/graphic-card";

/**
 * Hit this on a schedule (e.g. daily) from an external cron trigger — this
 * route itself doesn't run on a timer, Next.js can't do that. On Render:
 * Dashboard → New → Cron Job → same repo → command
 * `curl https://your-app.onrender.com/api/cron/generate-content` → schedule
 * "0 9 * * *" (daily at 9am). It's a no-op most days; it only actually
 * generates once the cadence in Settings (default 15 days) has elapsed,
 * which naturally lands around twice a month.
 */
export async function GET() {
  const settings = getSettings();
  if (!isDue(settings.cadenceDays)) {
    return NextResponse.json({ generated: false, reason: "not_due" });
  }

  const products = getAllProducts().filter((p) => p.featured);
  const product = products[Math.floor(Math.random() * products.length)] ?? getAllProducts()[0];
  const contentType = nextContentType();

  const media = pickNextMedia();
  const image = media ? media.url : await generateGraphicCard(product.name, product.fabric);
  const imageSource = media ? "media-library" : "generated-graphic";
  if (media) markUsed(media.id);

  const draft = await generateCaption(product, contentType);
  const post = addContentPost({
    productId: product.id,
    productName: product.name,
    image,
    imageSource,
    contentType,
    caption: draft.caption,
    hashtags: draft.hashtags,
  });

  markGenerated();
  const notification = await notifyOwner(
    `Scheduled Instagram ${contentType} post ready for review: "${product.name}". Approve it in the DEW admin dashboard.`
  );

  return NextResponse.json({ generated: true, item: post, ownerNotified: notification.sent });
}
