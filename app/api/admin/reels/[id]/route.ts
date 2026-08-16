import { NextRequest, NextResponse } from "next/server";
import { updateReel } from "@/lib/store/reel-queue";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "approve") {
    const reel = updateReel(id, { status: "approved" });
    if (!reel) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Instagram Reels publishing follows the same not-yet-configured path
    // as static posts — see lib/instagram-client.ts.
    return NextResponse.json({ item: reel, posted: false });
  }

  if (body.action === "reject") {
    const reel = updateReel(id, { status: "rejected" });
    if (!reel) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: reel });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
