import { NextRequest, NextResponse } from "next/server";
import { getLead, appendMessage, setDraftReply, setLeadStatus } from "@/lib/store/leads";
import { sendInstagramDM } from "@/lib/instagram-client";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const lead = getLead(id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.action === "approve-send") {
    const textToSend = body.text ?? lead.draftReply;
    if (!textToSend) return NextResponse.json({ error: "No draft to send" }, { status: 400 });

    const result = await sendInstagramDM(lead.igHandle, textToSend);
    appendMessage(lead.id, "admin", textToSend);
    setDraftReply(lead.id, null);
    if (body.status) setLeadStatus(lead.id, body.status);

    return NextResponse.json({ item: getLead(id), instagram: result });
  }

  if (body.action === "edit-draft") {
    setDraftReply(lead.id, body.text ?? "");
    return NextResponse.json({ item: getLead(id) });
  }

  if (body.action === "set-status") {
    setLeadStatus(lead.id, body.status);
    return NextResponse.json({ item: getLead(id) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
