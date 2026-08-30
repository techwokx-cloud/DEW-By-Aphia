import { NextRequest, NextResponse } from "next/server";
import { getSeedAdCampaign, updateSeedAdCampaign } from "@/lib/store/seed-ads";
import { activateSeedCampaign, deleteSeedCampaign } from "@/lib/meta-ads-client";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const campaign = await getSeedAdCampaign(id);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.action === "launch") {
    if (campaign.status !== "pending_approval") {
      return NextResponse.json({ error: `Can't launch a campaign in "${campaign.status}" status` }, { status: 400 });
    }
    if (!campaign.metaCampaignId || !campaign.metaAdSetId || !campaign.metaAdId) {
      return NextResponse.json({ error: "Campaign is missing Meta IDs — was it created successfully?" }, { status: 400 });
    }

    const result = await activateSeedCampaign(campaign.metaCampaignId, campaign.metaAdSetId, campaign.metaAdId);
    const updated = await updateSeedAdCampaign(id, {
      status: result.ok ? "active" : "failed",
      errorDetail: result.error ?? null,
    });

    if (result.ok) {
      await notifyOwner(`Seed ad launched — $${campaign.budgetUsd} over ${campaign.durationDays} days, ${campaign.objective} objective. It's live.`);
    }

    return NextResponse.json({ item: updated, launched: result.ok, error: result.error });
  }

  if (body.action === "reject") {
    if (campaign.status !== "pending_approval") {
      return NextResponse.json({ error: `Can't reject a campaign in "${campaign.status}" status` }, { status: 400 });
    }
    if (campaign.metaCampaignId) {
      await deleteSeedCampaign(campaign.metaCampaignId);
    }
    const updated = await updateSeedAdCampaign(id, { status: "rejected" });
    return NextResponse.json({ item: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
