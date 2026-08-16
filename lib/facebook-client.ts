/**
 * Facebook Page publishing via Meta's Graph API. Real integration, inert
 * until a Page access token and Page ID are set (Settings, or
 * FACEBOOK_PAGE_ACCESS_TOKEN / FACEBOOK_PAGE_ID env vars). Requires a
 * Facebook Page (can be the same Meta Business Suite as your Instagram
 * account) and the pages_manage_posts permission from Meta app review.
 */
import { getFacebookPageAccessToken, getFacebookPageId } from "@/lib/store/settings";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

function isConfigured() {
  return Boolean(getFacebookPageAccessToken() && getFacebookPageId());
}

export async function publishFacebookPost(imageUrl: string, caption: string) {
  if (!isConfigured()) return { sent: false, reason: "not_configured" as const };

  const pageId = getFacebookPageId();
  const token = getFacebookPageAccessToken();

  const res = await fetch(`${GRAPH_API_BASE}/${pageId}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: imageUrl, caption, access_token: token }),
  }).then((r) => r.json());

  return { sent: Boolean(res.id), postId: res.id, reason: res.id ? undefined : ("publish_failed" as const) };
}

export const facebookConfigured = isConfigured;
