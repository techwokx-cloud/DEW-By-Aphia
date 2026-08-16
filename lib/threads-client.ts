/**
 * Threads publishing via Meta's Threads Graph API (graph.threads.net — a
 * separate host and token from Instagram/Facebook, even though it's the
 * same Meta ecosystem). Real integration, inert until configured
 * (Settings, or THREADS_ACCESS_TOKEN / THREADS_USER_ID env vars).
 * Requires its own Meta app review for threads_content_publish.
 */
import { getThreadsAccessToken, getThreadsUserId } from "@/lib/store/settings";

const BASE_URL = "https://graph.threads.net/v1.0";

function isConfigured() {
  return Boolean(getThreadsAccessToken() && getThreadsUserId());
}

export async function publishThreadsPost(text: string, imageUrl?: string) {
  if (!isConfigured()) return { sent: false, reason: "not_configured" as const };

  const userId = getThreadsUserId();
  const token = getThreadsAccessToken();

  const container = await fetch(`${BASE_URL}/${userId}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: imageUrl ? "IMAGE" : "TEXT",
      text: text.slice(0, 500),
      ...(imageUrl ? { image_url: imageUrl } : {}),
      access_token: token,
    }),
  }).then((r) => r.json());

  if (!container.id) return { sent: false, reason: "container_failed" as const, detail: container };

  // Threads recommends waiting before publishing to allow media processing.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const publish = await fetch(`${BASE_URL}/${userId}/threads_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: container.id, access_token: token }),
  }).then((r) => r.json());

  return { sent: Boolean(publish.id), postId: publish.id, reason: publish.id ? undefined : ("publish_failed" as const) };
}

export const threadsConfigured = isConfigured;
