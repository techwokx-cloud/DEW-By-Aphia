import { CUSTOM_ORDER_PHOTOS } from "@/lib/custom-orders-data";
import { COLLECTIONS, HERO_IMAGES } from "@/lib/collections-data";

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  uploadedAt: string;
  lastUsedAt: string | null;
  /** Media tagged for a specific 7-day content window, per the "upload for
   * 7 days content" request — after that window it's just part of the
   * general rotation pool. */
  windowExpiresAt: string | null;
}

/**
 * Phase 1: in-memory + files written to /public/uploads at runtime. Note:
 * Render's filesystem is ephemeral on most plans — uploaded files and this
 * list survive as long as the instance stays up, but WON'T survive a
 * redeploy or restart. For real persistence, wire this to Cloudinary
 * (already in the original tech stack plan) or Supabase Storage — swap the
 * upload handler in app/api/admin/media/route.ts and keep this interface.
 */
const LIBRARY: MediaItem[] = [];

function seedFromExisting() {
  if (LIBRARY.length > 0) return;
  const existingUrls = [
    ...CUSTOM_ORDER_PHOTOS,
    ...COLLECTIONS.flatMap((c) => c.images),
    ...HERO_IMAGES,
  ];

  for (const url of existingUrls) {
    LIBRARY.push({
      id: `media_seed_${Buffer.from(url).toString("base64url").slice(0, 12)}`,
      url,
      type: "image",
      uploadedAt: new Date().toISOString(),
      lastUsedAt: null,
      windowExpiresAt: null,
    });
  }
}
seedFromExisting();

export function listMedia(): MediaItem[] {
  return [...LIBRARY].sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}

export function addMedia(input: { url: string; type: MediaItem["type"]; windowDays?: number }): MediaItem {
  const item: MediaItem = {
    id: `media_${Date.now()}`,
    url: input.url,
    type: input.type,
    uploadedAt: new Date().toISOString(),
    lastUsedAt: null,
    windowExpiresAt: input.windowDays
      ? new Date(Date.now() + input.windowDays * 86400000).toISOString()
      : null,
  };
  LIBRARY.push(item);
  return item;
}

export function markUsed(id: string) {
  const item = LIBRARY.find((m) => m.id === id);
  if (item) item.lastUsedAt = new Date().toISOString();
}

/** Picks the next usable media item: prefer items still inside their 7-day
 * window, never repeat something used in the last 30 days. Returns null if
 * everything's been used recently — caller should fall back to a
 * generated graphic in that case. */
export function pickNextMedia(): MediaItem | null {
  const now = Date.now();
  const THIRTY_DAYS = 30 * 86400000;

  const eligible = LIBRARY.filter((m) => {
    if (!m.lastUsedAt) return true;
    return now - new Date(m.lastUsedAt).getTime() > THIRTY_DAYS;
  });
  if (eligible.length === 0) return null;

  // Prefer items currently inside their intended 7-day window, oldest-used first
  const withinWindow = eligible.filter((m) => m.windowExpiresAt && new Date(m.windowExpiresAt).getTime() > now);
  const pool = withinWindow.length > 0 ? withinWindow : eligible;

  return [...pool].sort((a, b) => {
    const aUsed = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
    const bUsed = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
    return aUsed - bUsed;
  })[0];
}
