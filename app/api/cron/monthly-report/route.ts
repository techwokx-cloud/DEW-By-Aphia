import { NextResponse } from "next/server";
import { listOrders } from "@/lib/store/orders";
import { listLeads } from "@/lib/store/leads";
import { listContentPosts } from "@/lib/store/content-queue";
import { listReels } from "@/lib/store/reel-queue";
import { listSeedAdCampaigns } from "@/lib/store/seed-ads";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";

/**
 * Hit this once a day from an external cron trigger, same pattern as the
 * other /api/cron routes — it's a no-op every day except the 1st of the
 * month, so it's safe to schedule daily. Sends one WhatsApp digest
 * covering the month that just ended: orders/revenue, leads, content
 * posted, reels, and the seed ad — so the owner gets the full picture
 * without opening the admin dashboard at all.
 */
export async function GET() {
  const today = new Date();
  if (today.getDate() !== 1) {
    return NextResponse.json({ sent: false, reason: "not_the_1st" });
  }

  // "The month that just ended" — if today is the 1st, that's last month.
  const periodEnd = new Date(today.getFullYear(), today.getMonth(), 1);
  const periodStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const monthLabel = periodStart.toLocaleString("en-US", { month: "long", year: "numeric" });

  const inPeriod = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= periodStart.getTime() && t < periodEnd.getTime();
  };

  const [orders, leads, posts, reels, adCampaigns] = await Promise.all([
    listOrders(),
    listLeads(),
    listContentPosts(),
    listReels(),
    listSeedAdCampaigns(),
  ]);

  const monthOrders = orders.filter((o) => inPeriod(o.createdAt));
  const paidOrders = monthOrders.filter((o) => o.status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const monthLeads = leads.filter((l) => inPeriod(l.createdAt));
  const wonLeads = monthLeads.filter((l) => l.status === "won");

  const monthPosts = posts.filter((p) => inPeriod(p.createdAt));
  const postedCount = monthPosts.filter((p) => p.status === "posted").length;

  const monthReels = reels.filter((r) => inPeriod(r.createdAt));
  const reelsPostedCount = monthReels.filter((r) => r.status === "posted").length;

  const monthKey = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, "0")}`;
  const seedAd = adCampaigns.find((c) => c.month === monthKey);
  const seedAdLine = seedAd
    ? `Seed ad: ${seedAd.status === "active" || seedAd.status === "completed" ? `ran ($${seedAd.budgetUsd}, ${seedAd.objective})` : seedAd.status === "rejected" ? "skipped" : "did not launch"}`
    : "Seed ad: none created";

  const message =
    `📊 ${monthLabel} recap for DEW by Aphia\n\n` +
    `Orders: ${monthOrders.length} (${paidOrders.length} paid) · Revenue: $${revenue.toFixed(2)}\n` +
    `Leads: ${monthLeads.length} new (${wonLeads.length} won)\n` +
    `Content: ${postedCount}/${monthPosts.length} posts published\n` +
    `Reels: ${reelsPostedCount}/${monthReels.length} posted\n` +
    `${seedAdLine}\n\n` +
    `Full detail in the DEW admin dashboard, if you want it — but that's everything that matters.`;

  const result = await notifyOwner(message);

  return NextResponse.json({ sent: result.sent, reason: result.reason });
}
