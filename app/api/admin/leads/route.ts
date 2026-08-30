import { NextRequest, NextResponse } from "next/server";
import { listLeads, findOrCreateLead, appendMessage, setDraftReply, getLead } from "@/lib/store/leads";
import { generateDMReply } from "@/lib/ai/dm-agent";

export async function GET() {
  return NextResponse.json({ items: await listLeads() });
}

// "Simulate incoming DM" — stands in for the real Instagram webhook until
// a Meta App is connected (see app/api/instagram/webhook). Appends the
// message, then has the sales agent draft a reply for human approval.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const igHandle = (body.igHandle as string)?.trim();
  const text = (body.text as string)?.trim();
  if (!igHandle || !text) {
    return NextResponse.json({ error: "igHandle and text are required" }, { status: 400 });
  }

  const lead = await findOrCreateLead(igHandle);
  await appendMessage(lead.id, "lead", text);
  const updatedLead = (await getLead(lead.id))!;
  const draft = await generateDMReply(updatedLead.messages);
  await setDraftReply(lead.id, draft.reply);

  return NextResponse.json({ item: updatedLead, source: draft.source }, { status: 201 });
}
