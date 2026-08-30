import { query, queryOne } from "@/lib/db";
import { CUSTOM_ORDER_PHOTOS } from "@/lib/custom-orders-data";
import { COLLECTIONS, HERO_IMAGES } from "@/lib/collections-data";

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  uploadedAt: string;
  lastUsedAt: string | null;
  windowExpiresAt: string | null;
}

interface MediaRow {
  id: string;
  url: string;
  type: MediaItem["type"];
  uploaded_at: string;
  last_used_at: string | null;
  window_expires_at: string | null;
}

function fromRow(r: MediaRow): MediaItem {
  return {
    id: r.id,
    url: r.url,
    type: r.type,
    uploadedAt: new Date(r.uploaded_at).toISOString(),
    lastUsedAt: r.last_used_at ? new Date(r.last_used_at).toISOString() : null,
    windowExpiresAt: r.window_expires_at ? new Date(r.window_expires_at).toISOString() : null,
  };
}

let seeded = false;

/** Seeds the library from existing product/collection photos exactly once
 * — guarded by a real row count, not a module-level flag, so it's safe
 * across server restarts and multiple app instances. */
async function ensureSeeded() {
  if (seeded) return;
  const existing = await queryOne<{ count: string }>(`SELECT count(*) FROM media_library`);
  if (existing && Number(existing.count) > 0) {
    seeded = true;
    return;
  }

  const urls = [...CUSTOM_ORDER_PHOTOS, ...COLLECTIONS.flatMap((c) => c.images), ...HERO_IMAGES];
  for (const url of urls) {
    const id = `media_seed_${Buffer.from(url).toString("base64url").slice(0, 12)}`;
    await queryOne(
      `INSERT INTO media_library (id, url, type) VALUES ($1, $2, 'image') ON CONFLICT (id) DO NOTHING`,
      [id, url]
    );
  }
  seeded = true;
}

export async function listMedia(): Promise<MediaItem[]> {
  await ensureSeeded();
  const rows = await query<MediaRow>(`SELECT * FROM media_library ORDER BY uploaded_at DESC`);
  return rows.map(fromRow);
}

export async function addMedia(input: { url: string; type: MediaItem["type"]; windowDays?: number }): Promise<MediaItem> {
  await ensureSeeded();
  const id = `media_${Date.now()}`;
  const windowExpiresAt = input.windowDays ? new Date(Date.now() + input.windowDays * 86400000).toISOString() : null;
  const row = await queryOne<MediaRow>(
    `INSERT INTO media_library (id, url, type, window_expires_at) VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, input.url, input.type, windowExpiresAt]
  );
  return fromRow(row!);
}

export async function markUsed(id: string): Promise<void> {
  await queryOne(`UPDATE media_library SET last_used_at = now() WHERE id = $1`, [id]);
}

/** Picks the next usable media item: prefer items inside their 7-day
 * window, never repeat something used in the last 30 days. Returns null
 * if everything's been used recently — caller falls back to a generated
 * graphic. Implemented as one SQL query instead of pulling everything
 * into JS and filtering, now that this is a real table. */
export async function pickNextMedia(): Promise<MediaItem | null> {
  await ensureSeeded();
  const row = await queryOne<MediaRow>(
    `SELECT * FROM media_library
     WHERE last_used_at IS NULL OR last_used_at < now() - interval '30 days'
     ORDER BY
       (window_expires_at IS NOT NULL AND window_expires_at > now()) DESC,
       last_used_at ASC NULLS FIRST
     LIMIT 1`
  );
  return row ? fromRow(row) : null;
}
