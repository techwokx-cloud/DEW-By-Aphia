import { NextRequest, NextResponse } from "next/server";
import { findOrCreateLead, appendMessage, setDraftReply } from "@/lib/store/leads";
import { generateDMReply } from "@/lib/ai/dm-agent";

// Meta's webhook verification handshake — required once, when you register
// this URL in the Meta App dashboard's webhook settings.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.IG_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "verification_failed" }, { status: 403 });
}

// Real incoming Instagram DM events land here once the webhook is
// registered with Meta. The sales agent drafts a reply immediately, but
// nothing sends automatically — it waits in the admin Leads inbox for
// human approval, per the human-in-the-loop requirement.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.entry) return NextResponse.json({ ok: true });

  for (const entry of body.entry) {
    for (const event of entry.messaging ?? []) {
      const senderId = event.sender?.id;
      const text = event.message?.text;
      if (!senderId || !text) continue;

      const lead = findOrCreateLead(senderId);
      appendMessage(lead.id, "lead", text);
      const draft = await generateDMReply(lead.messages);
      setDraftReply(lead.id, draft.reply);
    }
  }

  return NextResponse.json({ ok: true });
}
