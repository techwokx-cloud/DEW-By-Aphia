import { query, queryOne } from "@/lib/db";

export type AdObjective = "engagement" | "leads" | "reach";

export interface SeedAdCampaign {
  id: string;
  month: string; // 'YYYY-MM'
  objective: AdObjective;
  budgetUsd: number;
  durationDays: number;
  headline: string | null;
  primaryText: string | null;
  creativeImage: string | null;
  metaCampaignId: string | null;
  metaAdSetId: string | null;
  metaAdId: string | null;
  status: "pending_approval" | "active" | "completed" | "failed" | "rejected";
  errorDetail: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

interface Row {
  id: string;
  month: string;
  objective: AdObjective;
  budget_usd: string;
  duration_days: number;
  headline: string | null;
  primary_text: string | null;
  creative_image: string | null;
  meta_campaign_id: string | null;
  meta_adset_id: string | null;
  meta_ad_id: string | null;
  status: SeedAdCampaign["status"];
  error_detail: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

function fromRow(r: Row): SeedAdCampaign {
  return {
    id: r.id,
    month: r.month,
    objective: r.objective,
    budgetUsd: Number(r.budget_usd),
    durationDays: r.duration_days,
    headline: r.headline,
    primaryText: r.primary_text,
    creativeImage: r.creative_image,
    metaCampaignId: r.meta_campaign_id,
    metaAdSetId: r.meta_adset_id,
    metaAdId: r.meta_ad_id,
    status: r.status,
    errorDetail: r.error_detail,
    startTime: r.start_time ? new Date(r.start_time).toISOString() : null,
    endTime: r.end_time ? new Date(r.end_time).toISOString() : null,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export async function listSeedAdCampaigns(): Promise<SeedAdCampaign[]> {
  const rows = await query<Row>(`SELECT * FROM seed_ad_campaigns ORDER BY created_at DESC`);
  return rows.map(fromRow);
}

export async function getSeedAdCampaign(id: string): Promise<SeedAdCampaign | undefined> {
  const row = await queryOne<Row>(`SELECT * FROM seed_ad_campaigns WHERE id = $1`, [id]);
  return row ? fromRow(row) : undefined;
}

export async function getCampaignForMonth(month: string): Promise<SeedAdCampaign | undefined> {
  const row = await queryOne<Row>(`SELECT * FROM seed_ad_campaigns WHERE month = $1`, [month]);
  return row ? fromRow(row) : undefined;
}

export async function createSeedAdCampaign(input: {
  month: string;
  objective: AdObjective;
  budgetUsd: number;
  durationDays: number;
  headline: string;
  primaryText: string;
  creativeImage: string;
  metaCampaignId: string | null;
  metaAdSetId: string | null;
  metaAdId: string | null;
  status: SeedAdCampaign["status"];
  errorDetail?: string | null;
  startTime: string | null;
  endTime: string | null;
}): Promise<SeedAdCampaign> {
  const id = `seedad_${Date.now()}`;
  const row = await queryOne<Row>(
    `INSERT INTO seed_ad_campaigns
       (id, month, objective, budget_usd, duration_days, headline, primary_text, creative_image,
        meta_campaign_id, meta_adset_id, meta_ad_id, status, error_detail, start_time, end_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      id, input.month, input.objective, input.budgetUsd, input.durationDays,
      input.headline, input.primaryText, input.creativeImage,
      input.metaCampaignId, input.metaAdSetId, input.metaAdId,
      input.status, input.errorDetail ?? null, input.startTime, input.endTime,
    ]
  );
  return fromRow(row!);
}

export async function updateSeedAdCampaign(id: string, patch: Partial<SeedAdCampaign>): Promise<SeedAdCampaign | null> {
  const existing = await getSeedAdCampaign(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  const row = await queryOne<Row>(
    `UPDATE seed_ad_campaigns
     SET meta_campaign_id = $2, meta_adset_id = $3, meta_ad_id = $4, status = $5, error_detail = $6
     WHERE id = $1
     RETURNING *`,
    [id, merged.metaCampaignId, merged.metaAdSetId, merged.metaAdId, merged.status, merged.errorDetail]
  );
  return row ? fromRow(row) : null;
}

const CYCLE: AdObjective[] = ["engagement", "leads", "reach"];

export async function getLastObjective(): Promise<AdObjective | null> {
  const row = await queryOne<{ last_objective: AdObjective | null }>(
    `SELECT last_objective FROM seed_ad_schedule WHERE id = 1`
  );
  return row?.last_objective ?? null;
}

/** Rotates through engagement → leads → reach → repeat, one step per
 * month, so the ad account doesn't optimize for the same signal every
 * time — tracked in its own tiny table rather than inferred from the
 * campaigns table so it still works correctly even if a month is skipped. */
export async function nextObjective(): Promise<AdObjective> {
  const row = await queryOne<{ last_objective: AdObjective | null }>(
    `SELECT last_objective FROM seed_ad_schedule WHERE id = 1`
  );
  if (!row) {
    await queryOne(`INSERT INTO seed_ad_schedule (id, last_objective) VALUES (1, NULL)`);
    return CYCLE[0];
  }
  if (!row.last_objective) return CYCLE[0];
  const lastIndex = CYCLE.indexOf(row.last_objective);
  return CYCLE[(lastIndex + 1) % CYCLE.length];
}

export async function markObjectiveUsed(objective: AdObjective): Promise<void> {
  await queryOne(
    `INSERT INTO seed_ad_schedule (id, last_objective) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET last_objective = $1`,
    [objective]
  );
}
