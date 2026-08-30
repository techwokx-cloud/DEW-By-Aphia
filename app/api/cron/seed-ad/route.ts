import { NextResponse } from "next/server";
import { getCampaignForMonth, createSeedAdCampaign, getLastObjective, markObjectiveUsed } from "@/lib/store/seed-ads";
import { getSeedAdBudgetUsd } from "@/lib/store/settings";
import { generateAdCreative } from "@/lib/ai/ad-creative-agent";
import { decideAdStrategy } from "@/lib/ai/ad-strategy-agent";
import { listLeads } from "@/lib/store/leads";
import { pickNextMedia, markUsed } from "@/lib/store/media-library";
import { generateFalImage, buildPosterPrompt } from "@/lib/fal-client";
import { generateGraphicCard } from "@/lib/graphic-card";
import { createSeedCampaign, metaAdsConfigured } from "@/lib/meta-ads-client";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";
import { getPublicSiteUrl } from "@/lib/site-url";

/**
 * Hit this once a day from an external cron trigger, same as
 * /api/cron/generate-content — it's a no-op every day except the one where
 * a campaign for the current calendar month doesn't exist yet, so it's
 * safe to schedule daily and let this route decide when it's actually due.
 *
 * This creates the campaign/ad set/ad on Meta's side fully PAUSED and
 * notifies the owner over WhatsApp — nothing spends until the owner taps
 * "Launch" on /admin/ads. That's deliberate: this is real ad budget, and
 * a human confirms it every month before it goes live.
 */
export async function GET() {
  const now = new Date();
  const month = now.toISOString().slice(0, 7); // 'YYYY-MM'
  const monthNumber = now.getMonth() + 1;

  const existing = await getCampaignForMonth(month);
  if (existing) {
    return NextResponse.json({ created: false, reason: "already_exists_for_month", item: existing });
  }

  if (!metaAdsConfigured()) {
    return NextResponse.json({ created: false, reason: "not_configured" });
  }

  const [lastObjective, leads] = await Promise.all([getLastObjective(), listLeads()]);
  const strategy = await decideAdStrategy({ lastObjective, leads });
  const objective = strategy.objective;

  const budgetUsd = Math.max(10, getSeedAdBudgetUsd());
  const durationDays = 10;

  const draft = await generateAdCreative(objective);

  const media = await pickNextMedia();
  let imageUrl: string;
  if (media) {
    imageUrl = new URL(media.url, getPublicSiteUrl()).toString();
    await markUsed(media.id);
  } else {
    const falImage = await generateFalImage(buildPosterPrompt("Ankara wax print, DEW by Aphia collection"));
    if (falImage) {
      imageUrl = falImage; // fal.ai returns its own absolute, already-public URL
    } else {
      const graphicPath = await generateGraphicCard("DEW by Aphia", "Ankara");
      imageUrl = new URL(graphicPath, getPublicSiteUrl()).toString();
    }
  }

  const linkUrl = objective === "leads" ? `${getPublicSiteUrl()}/consultation` : `${getPublicSiteUrl()}/collections`;

  const result = await createSeedCampaign({
    objective,
    budgetUsd,
    durationDays,
    headline: draft.headline,
    primaryText: draft.primaryText,
    imageUrl,
    linkUrl,
  });

  const campaign = await createSeedAdCampaign({
    month,
    objective,
    budgetUsd,
    durationDays,
    headline: draft.headline,
    primaryText: draft.primaryText,
    creativeImage: imageUrl,
    metaCampaignId: result.campaignId ?? null,
    metaAdSetId: result.adSetId ?? null,
    metaAdId: result.adId ?? null,
    status: result.ok ? "pending_approval" : "failed",
    errorDetail: result.error ?? null,
    startTime: result.startTime ?? null,
    endTime: result.endTime ?? null,
  });

  const staleLeadCount = leads.filter((l) => l.status === "new" || l.status === "engaged").length;

  if (result.ok) {
    await markObjectiveUsed(objective);

    const leadLine = strategy.suggestLeadFollowUp && staleLeadCount > 0
      ? ` You've also got ${staleLeadCount} lead${staleLeadCount === 1 ? "" : "s"} sitting unconverted — worth a follow-up pass in Leads while this runs.`
      : "";

    await notifyOwner(
      `It's the start of month ${monthNumber} — this month's seed ad is ready: $${budgetUsd} over ${durationDays} days, ` +
      `${objective} objective (${strategy.reasoning})${leadLine}\n\n` +
      `Review it and tap Launch in the DEW admin dashboard → Seed Ads. Nothing spends until you do.`
    );
  } else {
    await notifyOwner(
      `Couldn't set up this month's seed ad automatically (${result.error ?? "unknown error"}). ` +
      `Check Meta Ads settings in the DEW admin dashboard.`
    );
  }

  return NextResponse.json({ created: result.ok, item: campaign, strategy });
}
