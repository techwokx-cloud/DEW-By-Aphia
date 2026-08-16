import { NextRequest, NextResponse } from "next/server";
import { getSettingsRedacted, updateSettings } from "@/lib/store/settings";

// Both GET and PATCH return secret fields redacted to "SET_IN_SETTINGS" /
// "SET_IN_ENV" / null rather than the raw value, even to an authenticated
// admin session — good hygiene once real payment/social tokens live here.
// Non-secret fields (cadence, model picker, etc.) come through as-is.
export async function GET() {
  return NextResponse.json({ item: getSettingsRedacted() });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  // Don't let a client accidentally overwrite a real secret with the
  // redacted placeholder string if a form round-trips it unchanged.
  const REDACTED_VALUES = ["SET_IN_SETTINGS", "SET_IN_ENV"];
  const clean = Object.fromEntries(
    Object.entries(body).filter(([, v]) => !(typeof v === "string" && REDACTED_VALUES.includes(v)))
  );
  updateSettings(clean);
  return NextResponse.json({ item: getSettingsRedacted() });
}
