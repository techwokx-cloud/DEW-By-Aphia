import { NextRequest, NextResponse } from "next/server";
import { getReel, updateReel } from "@/lib/store/reel-queue";
import { publishInstagramReel } from "@/lib/instagram-client";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "approve") {
    const existing = await getReel(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.renderStatus !== "ready" || !existing.videoUrl) {
      return NextResponse.json({ error: "Reel isn't rendered yet — wait for renderStatus to be 'ready'" }, { status: 400 });
    }

    const caption = `${existing.script.hook}\n\n${existing.script.caption}\n\n${existing.script.hashtags.map((h) => `#${h}`).join(" ")}`;
    const instagram = await publishInstagramReel(existing.videoUrl, caption);

    const reel = await updateReel(id, { status: instagram.sent ? "posted" : "approved" });
    return NextResponse.json({ item: reel, posted: instagram.sent, instagram });
  }

  if (body.action === "reject") {
    const reel = await updateReel(id, { status: "rejected" });
    if (!reel) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: reel });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
