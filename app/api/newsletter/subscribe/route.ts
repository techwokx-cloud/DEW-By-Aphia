import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/store/subscribers";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = (body.email as string)?.trim();
  const whatsapp = (body.whatsapp as string)?.trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const subscriber = addSubscriber(email, whatsapp);
  return NextResponse.json({ item: subscriber }, { status: 201 });
}
