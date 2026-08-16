import { NextRequest, NextResponse } from "next/server";
import { updateNewsletterDraft } from "@/lib/store/newsletter-queue";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "approve") {
    // Real sending requires an email provider (e.g. Resend, SendGrid) — not
    // yet configured, so this marks the draft ready rather than dispatching.
    const draft = updateNewsletterDraft(id, { status: "approved" });
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: draft, emailSent: false, reason: "email_provider_not_configured" });
  }

  if (body.action === "reject") {
    const draft = updateNewsletterDraft(id, { status: "rejected" });
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: draft });
  }

  const draft = updateNewsletterDraft(id, { subject: body.subject, body: body.body });
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: draft });
}
