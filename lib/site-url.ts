/**
 * The one true public URL for this site — used whenever we build a URL
 * that an external service (json2video, Meta's Graph API, etc.) needs to
 * fetch from the public internet. Never derive this from the incoming
 * request (request.nextUrl.origin) for that purpose — if the request came
 * from an internal cron call or localhost, that's what would get baked
 * into the URL, and external services can't reach localhost.
 */
export function getPublicSiteUrl(): string {
  return process.env.PUBLIC_SITE_URL || "https://dewbyaphia.online";
}
