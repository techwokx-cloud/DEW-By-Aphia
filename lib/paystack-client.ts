import { getPaystackSecretKey } from "@/lib/store/settings";

const BASE_URL = "https://api.paystack.co";

export function paystackConfigured(): boolean {
  return Boolean(getPaystackSecretKey());
}

interface InitializeParams {
  email: string;
  /** Amount in the currency's smallest unit (cents for USD, pesewas for
   * GHS) — Paystack, like Stripe, never takes a decimal amount. */
  amountMinorUnits: number;
  currency: "USD" | "GHS";
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

interface InitializeResult {
  ok: boolean;
  authorizationUrl?: string;
  reference?: string;
  error?: string;
}

/** Starts a Paystack transaction and returns the hosted checkout URL to
 * redirect the customer to — same shape as Stripe Checkout Sessions, so
 * the frontend (which just redirects to whatever `url` comes back from
 * POST /api/checkout) needs no changes for this swap. */
export async function initializeTransaction(params: InitializeParams): Promise<InitializeResult> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) return { ok: false, error: "not_configured" };

  try {
    const res = await fetch(`${BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amountMinorUnits,
        currency: params.currency,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.status) {
      const detail = data?.message || `HTTP ${res.status}`;
      console.error("Paystack transaction initialize failed:", detail);
      return { ok: false, error: detail };
    }
    return { ok: true, authorizationUrl: data.data.authorization_url, reference: data.data.reference };
  } catch (err) {
    console.error("Paystack initialize request failed:", err);
    return { ok: false, error: String(err) };
  }
}

interface VerifyResult {
  ok: boolean;
  paid: boolean;
  reference?: string;
  amountMinorUnits?: number;
  error?: string;
}

/** Confirms a transaction's actual status directly from Paystack — used
 * as a fallback/double-check alongside the webhook, since a webhook can
 * be delayed or (in rare cases) missed entirely. */
export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) return { ok: false, paid: false, error: "not_configured" };

  try {
    const res = await fetch(`${BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.status) {
      return { ok: false, paid: false, error: data?.message || `HTTP ${res.status}` };
    }
    return {
      ok: true,
      paid: data.data.status === "success",
      reference: data.data.reference,
      amountMinorUnits: data.data.amount,
    };
  } catch (err) {
    console.error("Paystack verify request failed:", err);
    return { ok: false, paid: false, error: String(err) };
  }
}

/** Verifies a Paystack webhook came from Paystack: HMAC-SHA512 of the raw
 * request body, keyed with your secret key, must match the
 * `x-paystack-signature` header exactly. Never trust an unverified
 * webhook for something that confirms real payment. */
export async function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey || !signatureHeader) return false;

  const { createHmac } = await import("crypto");
  const expected = createHmac("sha512", secretKey).update(rawBody).digest("hex");

  // Constant-time comparison to avoid timing attacks on the signature check.
  const { timingSafeEqual } = await import("crypto");
  const expectedBuf = Buffer.from(expected, "hex");
  const givenBuf = Buffer.from(signatureHeader, "hex");
  if (expectedBuf.length !== givenBuf.length) return false;
  return timingSafeEqual(expectedBuf, givenBuf);
}
