import { query, queryOne } from "@/lib/db";
import type { ReelScript } from "@/lib/ai/reel-script-agent";

export interface ReelDraft {
  id: string;
  productName: string;
  script: ReelScript;
  videoUrl: string | null;
  renderProjectId: string | null;
  renderStatus: "not_configured" | "pending" | "ready" | "failed";
  renderError?: string;
  status: "draft" | "approved" | "rejected" | "posted";
  createdAt: string;
}

interface ReelRow {
  id: string;
  product_name: string;
  script: ReelScript;
  video_url: string | null;
  render_project_id: string | null;
  render_status: ReelDraft["renderStatus"];
  render_error: string | null;
  status: ReelDraft["status"];
  created_at: string;
}

function fromRow(r: ReelRow): ReelDraft {
  return {
    id: r.id,
    productName: r.product_name,
    script: r.script,
    videoUrl: r.video_url,
    renderProjectId: r.render_project_id,
    renderStatus: r.render_status,
    renderError: r.render_error ?? undefined,
    status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export async function listReels(): Promise<ReelDraft[]> {
  const rows = await query<ReelRow>(`SELECT * FROM reels ORDER BY created_at DESC`);
  return rows.map(fromRow);
}

export async function getReel(id: string): Promise<ReelDraft | undefined> {
  const row = await queryOne<ReelRow>(`SELECT * FROM reels WHERE id = $1`, [id]);
  return row ? fromRow(row) : undefined;
}

export async function addReel(input: Omit<ReelDraft, "id" | "createdAt" | "status">): Promise<ReelDraft> {
  const id = `reel_${Date.now()}`;
  const row = await queryOne<ReelRow>(
    `INSERT INTO reels (id, product_name, script, video_url, render_project_id, render_status, render_error, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
     RETURNING *`,
    [id, input.productName, JSON.stringify(input.script), input.videoUrl, input.renderProjectId, input.renderStatus, input.renderError ?? null]
  );
  return fromRow(row!);
}

export async function updateReel(id: string, patch: Partial<ReelDraft>): Promise<ReelDraft | null> {
  const existing = await getReel(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  const row = await queryOne<ReelRow>(
    `UPDATE reels
     SET video_url = $2, render_project_id = $3, render_status = $4, render_error = $5, status = $6
     WHERE id = $1
     RETURNING *`,
    [id, merged.videoUrl, merged.renderProjectId, merged.renderStatus, merged.renderError ?? null, merged.status]
  );
  return row ? fromRow(row) : null;
}
