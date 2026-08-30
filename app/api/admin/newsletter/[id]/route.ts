import { NextRequest, NextResponse } from "next/server";
import { updateNewsletterDraft } from "@/lib/store/newsletter-queue";
import { listSubscribers } from "@/lib/store/subscribers";
import { sendMail, mailerConfigured } from "@/lib/mailer";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "approve") {
    const draft = await updateNewsletterDraft(id, { status: "approved" });
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!mailerConfigured()) {
      return NextResponse.json({ item: draft, emailSent: false, reason: "email_provider_not_configured" });
    }

    const subscribers = await listSubscribers();
    // Sent one-by-one rather than a single BCC blast — keeps each
    // subscriber's address out of every other recipient's headers, and
    // one bad address failing doesn't take the rest down with it.
    const results = await Promise.all(
      subscribers.map((s) =>
        sendMail({
          to: s.email,
          subject: draft.subject,
          html: draft.body,
        })
      )
    );
    const sentCount = results.filter((r) => r.sent).length;
    const sentDraft = await updateNewsletterDraft(id, { status: "sent" });

    return NextResponse.json({
      item: sentDraft,
      emailSent: sentCount > 0,
      sentCount,
      totalSubscribers: subscribers.length,
    });
  }

  if (body.action === "reject") {
    const draft = await updateNewsletterDraft(id, { status: "rejected" });
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: draft });
  }

  const draft = await updateNewsletterDraft(id, { subject: body.subject, body: body.body });
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: draft });
}
