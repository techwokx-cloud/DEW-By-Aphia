/**
 * Thin wrapper around Meta's Instagram Graph API. Real, production-shaped
 * integration code — but every function is a no-op (returns { sent: false,
 * reason: "not_configured" }) until an access token and business account
 * ID are set — either in Settings (admin dashboard) or as env vars
 * (IG_ACCESS_TOKEN, IG_BUSINESS_ACCOUNT_ID).
 *
 * Getting those requires, on your end: a Meta Developer App, an Instagram
 * Business Account linked to a Facebook Page, and Meta's app review for the
 * instagram_business_manage_messages / content_publish permissions. None of
 * that can be done from here — this file is ready for the moment it is.
 */
import { getIgAccessToken, getIgBusinessAccountId } from "@/lib/store/settings";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

function isConfigured() {
  return Boolean(getIgAccessToken() && getIgBusinessAccountId());
}

export async function publishInstagramPost(imageUrl: string, caption: string) {
  if (!isConfigured()) {
    return { sent: false, reason: "not_configured" as const };
  }
  const accountId = getIgBusinessAccountId();
  const token = getIgAccessToken();

  // Two-step publish per Meta's Content Publishing API: create a media
  // container, then publish it.
  const container = await fetch(`${GRAPH_API_BASE}/${accountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
  }).then((r) => r.json());

  if (!container.id) return { sent: false, reason: "container_failed" as const, detail: container };

  const publish = await fetch(`${GRAPH_API_BASE}/${accountId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: container.id, access_token: token }),
  }).then((r) => r.json());

  return { sent: Boolean(publish.id), postId: publish.id, reason: publish.id ? undefined : ("publish_failed" as const) };
}

/** Instagram Reels publish the same way as feed posts via the Graph API,
 * just with media_type: REELS and a video_url instead of image_url. */
export async function publishInstagramReel(videoUrl: string, caption: string) {
  if (!isConfigured()) {
    return { sent: false, reason: "not_configured" as const };
  }
  const accountId = getIgBusinessAccountId();
  const token = getIgAccessToken();

  const container = await fetch(`${GRAPH_API_BASE}/${accountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ media_type: "REELS", video_url: videoUrl, caption, access_token: token }),
  }).then((r) => r.json());

  if (!container.id) return { sent: false, reason: "container_failed" as const, detail: container };

  const publish = await fetch(`${GRAPH_API_BASE}/${accountId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: container.id, access_token: token }),
  }).then((r) => r.json());

  return { sent: Boolean(publish.id), postId: publish.id, reason: publish.id ? undefined : ("publish_failed" as const) };
}

export async function sendInstagramDM(recipientIgsid: string, text: string) {
  if (!isConfigured()) {
    return { sent: false, reason: "not_configured" as const };
  }
  const accountId = getIgBusinessAccountId();
  const token = getIgAccessToken();

  const res = await fetch(`${GRAPH_API_BASE}/${accountId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { id: recipientIgsid }, message: { text }, access_token: token }),
  }).then((r) => r.json());

  return { sent: Boolean(res.message_id), messageId: res.message_id, reason: res.message_id ? undefined : ("send_failed" as const) };
}

export const instagramConfigured = isConfigured;
