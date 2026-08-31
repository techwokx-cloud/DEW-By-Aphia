import { NextRequest, NextResponse } from "next/server";
import { findOrCreateLead, appendMessage, setDraftReply, getLead } from "@/lib/store/leads";
import { generateDMReply } from "@/lib/ai/dm-agent";

// Meta's webhook verification handshake — required once, when you register
// this URL in the Meta App dashboard's webhook settings (subscribe the
// Page to the "messages" field, same App as your Instagram integration
// if they share a Meta Business Suite).
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.FB_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "verification_failed" }, { status: 403 });
}

// Real incoming Facebook Page Messenger events land here once the webhook
// is registered with Meta. Same payload shape as the Instagram webhook —
// both ride Meta's Messenger Platform — the only difference that matters
// here is tagging the lead with platform: "facebook" so replies go out
// through the right Send API / access token.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.entry) return NextResponse.json({ ok: true });

  for (const entry of body.entry) {
    for (const event of entry.messaging ?? []) {
      const senderId = event.sender?.id;
      const text = event.message?.text;
      if (!senderId || !text) continue;

      const lead = await findOrCreateLead("facebook", senderId);
      await appendMessage(lead.id, "lead", text);
      const updatedLead = (await getLead(lead.id))!;
      const draft = await generateDMReply(updatedLead.messages);
      await setDraftReply(lead.id, draft.reply);
    }
  }

  return NextResponse.json({ ok: true });
}
