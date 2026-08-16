import { NextResponse } from "next/server";
import { listSubscribers } from "@/lib/store/subscribers";

export async function GET() {
  return NextResponse.json({ items: listSubscribers() });
}
