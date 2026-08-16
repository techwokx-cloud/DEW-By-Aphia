import { NextRequest, NextResponse } from "next/server";

const FALLBACK_PASSWORD = "dew-admin-2026";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_PASSWORD || FALLBACK_PASSWORD;
  const cookie = request.cookies.get("admin_pw")?.value;
  const authenticated = cookie === expected;

  if (authenticated) return NextResponse.next();

  // API routes get a plain 401 (a redirect would return HTML to a fetch()
  // call and break every admin page silently) — page routes get sent to login.
  if (pathname.startsWith("/api/admin/")) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
