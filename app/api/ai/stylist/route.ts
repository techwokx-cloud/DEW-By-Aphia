import { NextRequest, NextResponse } from "next/server";
import { getStylistReply, type ChatMessage } from "@/lib/ai/stylist";

export async function POST(request: NextRequest) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages[] is required" }, { status: 400 });
  }

  const result = await getStylistReply(messages);
  return NextResponse.json(result);
}
