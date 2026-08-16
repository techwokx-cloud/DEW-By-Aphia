import { NextResponse } from "next/server";
import { listNewsletterDrafts, addNewsletterDraft } from "@/lib/store/newsletter-queue";
import { generateNewsletterDraft } from "@/lib/ai/newsletter-agent";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";

export async function GET() {
  return NextResponse.json({ items: listNewsletterDrafts() });
}

export async function POST() {
  const draft = await generateNewsletterDraft();
  const saved = addNewsletterDraft({ subject: draft.subject, body: draft.body });

  const notification = await notifyOwner(
    `New newsletter draft ready for review: "${draft.subject}". Approve it in the DEW admin dashboard.`
  );

  return NextResponse.json({ item: saved, source: draft.source, ownerNotified: notification.sent }, { status: 201 });
}
