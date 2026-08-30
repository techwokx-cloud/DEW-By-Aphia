import { getMetaAdAccountId, getMetaAdsAccessToken, getFacebookPageId, getIgBusinessAccountId } from "@/lib/store/settings";
import type { AdObjective } from "@/lib/store/seed-ads";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

export function metaAdsConfigured(): boolean {
  return Boolean(getMetaAdAccountId() && getMetaAdsAccessToken() && getFacebookPageId());
}

/** Maps our three rotating objectives to Meta's current (ODAX) campaign
 * objectives and the matching ad-set optimization goal. "Reach" doesn't
 * exist as its own ODAX top-level objective anymore — OUTCOME_AWARENESS
 * with a REACH optimization goal is the closest real equivalent. */
const OBJECTIVE_MAP: Record<AdObjective, { campaignObjective: string; optimizationGoal: string; destinationType?: string }> = {
  engagement: { campaignObjective: "OUTCOME_ENGAGEMENT", optimizationGoal: "POST_ENGAGEMENT" },
  leads: { campaignObjective: "OUTCOME_LEADS", optimizationGoal: "LEAD_GENERATION" },
  reach: { campaignObjective: "OUTCOME_AWARENESS", optimizationGoal: "REACH" },
};

interface CreateSeedCampaignParams {
  objective: AdObjective;
  budgetUsd: number;
  durationDays: number;
  headline: string;
  primaryText: string;
  imageUrl: string;
  linkUrl: string;
}

interface CreateSeedCampaignResult {
  ok: boolean;
  campaignId?: string;
  adSetId?: string;
  adId?: string;
  startTime?: string;
  endTime?: string;
  error?: string;
}

async function metaFetch(path: string, body: Record<string, unknown>): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const token = getMetaAdsAccessToken();
  const res = await fetch(`${GRAPH_API_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: token }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

/**
 * Creates campaign → ad set → creative → ad, all as PAUSED. Nothing spends
 * a cent until something explicitly sets the ad's status to ACTIVE (see
 * activateSeedCampaign below) — that step is gated behind the owner
 * tapping "Launch" in the admin dashboard, on purpose, since this moves
 * real money.
 */
export async function createSeedCampaign(params: CreateSeedCampaignParams): Promise<CreateSeedCampaignResult> {
  const adAccountId = getMetaAdAccountId();
  const pageId = getFacebookPageId();
  const igAccountId = getIgBusinessAccountId();
  if (!metaAdsConfigured() || !adAccountId) {
    return { ok: false, error: "not_configured" };
  }

  const { campaignObjective, optimizationGoal } = OBJECTIVE_MAP[params.objective];
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + params.durationDays * 86400000);
  const lifetimeBudgetMinorUnits = Math.round(params.budgetUsd * 100);

  try {
    // 1. Campaign
    const campaign = await metaFetch(`act_${adAccountId}/campaigns`, {
      name: `DEW Seed Ad — ${params.objective} — ${startTime.toISOString().slice(0, 10)}`,
      objective: campaignObjective,
      status: "PAUSED",
      special_ad_categories: [],
    });
    if (!campaign.ok || !campaign.data.id) {
      return { ok: false, error: `Campaign creation failed: ${JSON.stringify(campaign.data)}` };
    }
    const campaignId = campaign.data.id as string;

    // 2. Ad set — lifetime_budget + start/end lets Meta pace spend across
    // the whole window automatically, rather than us computing a fragile
    // daily budget that could fall below the platform minimum.
    const adSet = await metaFetch(`act_${adAccountId}/adsets`, {
      name: `DEW Seed Ad Set — ${params.objective}`,
      campaign_id: campaignId,
      lifetime_budget: lifetimeBudgetMinorUnits,
      billing_event: "IMPRESSIONS",
      optimization_goal: optimizationGoal,
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      targeting: {
        geo_locations: { countries: ["GH"] },
        age_min: 21,
        age_max: 55,
      },
      status: "PAUSED",
    });
    if (!adSet.ok || !adSet.data.id) {
      return { ok: false, error: `Ad set creation failed: ${JSON.stringify(adSet.data)}` };
    }
    const adSetId = adSet.data.id as string;

    // 3. Creative
    const creative = await metaFetch(`act_${adAccountId}/adcreatives`, {
      name: `DEW Seed Ad Creative — ${params.objective}`,
      object_story_spec: {
        page_id: pageId,
        ...(igAccountId ? { instagram_actor_id: igAccountId } : {}),
        link_data: {
          image_url: params.imageUrl,
          link: params.linkUrl,
          message: params.primaryText,
          name: params.headline,
          call_to_action: {
            type: params.objective === "leads" ? "SIGN_UP" : "LEARN_MORE",
            value: { link: params.linkUrl },
          },
        },
      },
    });
    if (!creative.ok || !creative.data.id) {
      return { ok: false, error: `Creative creation failed: ${JSON.stringify(creative.data)}` };
    }
    const creativeId = creative.data.id as string;

    // 4. Ad
    const ad = await metaFetch(`act_${adAccountId}/ads`, {
      name: `DEW Seed Ad — ${params.objective}`,
      adset_id: adSetId,
      creative: { creative_id: creativeId },
      status: "PAUSED",
    });
    if (!ad.ok || !ad.data.id) {
      return { ok: false, error: `Ad creation failed: ${JSON.stringify(ad.data)}` };
    }

    return {
      ok: true,
      campaignId,
      adSetId,
      adId: ad.data.id as string,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
  } catch (err) {
    console.error("Meta Ads campaign creation failed:", err);
    return { ok: false, error: String(err) };
  }
}

/** Flips campaign, ad set, and ad all to ACTIVE — the only point in this
 * whole flow where money actually starts moving. Called only from the
 * admin "Launch" action, never automatically. */
export async function activateSeedCampaign(campaignId: string, adSetId: string, adId: string): Promise<{ ok: boolean; error?: string }> {
  const token = getMetaAdsAccessToken();
  if (!token) return { ok: false, error: "not_configured" };

  try {
    const results = await Promise.all(
      [campaignId, adSetId, adId].map((id) =>
        fetch(`${GRAPH_API_BASE}/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ACTIVE", access_token: token }),
        }).then((r) => r.json())
      )
    );
    const failed = results.find((r) => r.error);
    if (failed) return { ok: false, error: JSON.stringify(failed.error) };
    return { ok: true };
  } catch (err) {
    console.error("Meta Ads activation failed:", err);
    return { ok: false, error: String(err) };
  }
}

/** Cancels a campaign that was created but never launched — deletes it on
 * Meta's side so it doesn't linger as clutter in Ads Manager. */
export async function deleteSeedCampaign(campaignId: string): Promise<{ ok: boolean; error?: string }> {
  const token = getMetaAdsAccessToken();
  if (!token) return { ok: false, error: "not_configured" };
  try {
    const res = await fetch(`${GRAPH_API_BASE}/${campaignId}?access_token=${token}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: JSON.stringify(data) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
