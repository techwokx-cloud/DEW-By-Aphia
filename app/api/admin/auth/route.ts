import { NextRequest, NextResponse } from "next/server";

// Phase 1 protection: a single shared password gates /admin, stored in the
// ADMIN_PASSWORD env var. This is NOT real user auth (no accounts, no
// roles) — it exists so the dashboard isn't wide open on a public URL.
// Replace with real auth (Supabase Auth, NextAuth, etc.) before this
// handles real orders or customer data.
const FALLBACK_PASSWORD = "dew-admin-2026";

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  const expected = process.env.ADMIN_PASSWORD || FALLBACK_PASSWORD;

  if (password !== expected) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, usingFallback: !process.env.ADMIN_PASSWORD });
  res.cookies.set("admin_pw", expected, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("admin_pw");
  return res;
}
