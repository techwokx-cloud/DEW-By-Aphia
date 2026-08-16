export interface Settings {
  // Owner notifications
  ownerWhatsappOverride: string | null;
  cadenceDays: number;
  maxApprovalsPerMonth: number;

  // Instagram (Meta Graph API)
  igAccessToken: string | null;
  igBusinessAccountId: string | null;

  // Facebook Page (Meta Graph API)
  facebookPageAccessToken: string | null;
  facebookPageId: string | null;

  // Threads (Meta Graph API)
  threadsAccessToken: string | null;
  threadsUserId: string | null;

  // WhatsApp Business Platform (owner approval notifications)
  whatsappBusinessToken: string | null;
  whatsappPhoneNumberId: string | null;

  // fal.ai (AI image/video generation)
  falApiKey: string | null;
  falImageModel: string;
  falVideoModel: string | null;

  // json2video (reel rendering)
  json2videoApiKey: string | null;

  // Stripe (international checkout)
  stripeSecretKey: string | null;
  stripePublishableKey: string | null;
}

// Phase 1: in-memory, resets on restart. Every field here falls back to the
// matching env var when unset, so nothing breaks for values already set in
// Render — this just adds an in-app way to set/change them without a
// redeploy. Phase 2: persist to Supabase so this survives restarts.
const settings: Settings = {
  ownerWhatsappOverride: null,
  cadenceDays: 15,
  maxApprovalsPerMonth: 2,
  igAccessToken: null,
  igBusinessAccountId: null,
  facebookPageAccessToken: null,
  facebookPageId: null,
  threadsAccessToken: null,
  threadsUserId: null,
  whatsappBusinessToken: null,
  whatsappPhoneNumberId: null,
  falApiKey: null,
  falImageModel: "fal-ai/flux/schnell",
  falVideoModel: null,
  json2videoApiKey: null,
  stripeSecretKey: null,
  stripePublishableKey: null,
};

export function getSettings(): Settings {
  return { ...settings };
}

export function updateSettings(patch: Partial<Settings>): Settings {
  Object.assign(settings, patch);
  return { ...settings };
}

/** Redacts secrets before sending settings to the browser — admin UI shows
 * "•••• set" instead of the raw value once saved, so tokens aren't
 * re-displayed in plaintext after the fact. */
export function getSettingsRedacted(): Record<string, unknown> {
  const secretKeys: (keyof Settings)[] = [
    "igAccessToken",
    "facebookPageAccessToken",
    "threadsAccessToken",
    "whatsappBusinessToken",
    "falApiKey",
    "json2videoApiKey",
    "stripeSecretKey",
  ];
  const out: Record<string, unknown> = { ...settings };
  for (const key of secretKeys) {
    const envFallback = getEnvFallback(key);
    out[key] = settings[key] ? "SET_IN_SETTINGS" : envFallback ? "SET_IN_ENV" : null;
  }
  return out;
}

function getEnvFallback(key: keyof Settings): string | undefined {
  const map: Partial<Record<keyof Settings, string | undefined>> = {
    igAccessToken: process.env.IG_ACCESS_TOKEN,
    facebookPageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
    threadsAccessToken: process.env.THREADS_ACCESS_TOKEN,
    whatsappBusinessToken: process.env.WHATSAPP_BUSINESS_TOKEN,
    falApiKey: process.env.FAL_KEY || process.env.FAL_API_KEY,
    json2videoApiKey: process.env.JSON2VIDEO_API_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  };
  return map[key];
}

export function getOwnerWhatsappNumber(): string | null {
  return settings.ownerWhatsappOverride || process.env.WHATSAPP_OWNER_NUMBER || null;
}

export function getIgAccessToken(): string | null {
  return settings.igAccessToken || process.env.IG_ACCESS_TOKEN || null;
}
export function getIgBusinessAccountId(): string | null {
  return settings.igBusinessAccountId || process.env.IG_BUSINESS_ACCOUNT_ID || null;
}
export function getFacebookPageAccessToken(): string | null {
  return settings.facebookPageAccessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null;
}
export function getFacebookPageId(): string | null {
  return settings.facebookPageId || process.env.FACEBOOK_PAGE_ID || null;
}
export function getThreadsAccessToken(): string | null {
  return settings.threadsAccessToken || process.env.THREADS_ACCESS_TOKEN || null;
}
export function getThreadsUserId(): string | null {
  return settings.threadsUserId || process.env.THREADS_USER_ID || null;
}
export function getWhatsappBusinessToken(): string | null {
  return settings.whatsappBusinessToken || process.env.WHATSAPP_BUSINESS_TOKEN || null;
}
export function getWhatsappPhoneNumberId(): string | null {
  return settings.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || null;
}
export function getFalApiKey(): string | null {
  return settings.falApiKey || process.env.FAL_KEY || process.env.FAL_API_KEY || null;
}
export function getFalImageModel(): string {
  return settings.falImageModel || "fal-ai/flux/schnell";
}
export function getJson2videoApiKey(): string | null {
  return settings.json2videoApiKey || process.env.JSON2VIDEO_API_KEY || null;
}
export function getStripeSecretKey(): string | null {
  return settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY || null;
}
export function getStripePublishableKey(): string | null {
  return settings.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY || null;
}
