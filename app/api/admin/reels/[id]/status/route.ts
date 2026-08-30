import { NextResponse } from "next/server";
import { getReel, updateReel } from "@/lib/store/reel-queue";
import { checkRenderStatus } from "@/lib/json2video-client";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reel = await getReel(id);
  if (!reel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (reel.renderStatus !== "pending" || !reel.renderProjectId) {
    return NextResponse.json({ item: reel });
  }

  const status = await checkRenderStatus(reel.renderProjectId);
  if (status.done && status.videoUrl) {
    const updated = await updateReel(id, { videoUrl: status.videoUrl, renderStatus: "ready" });
    return NextResponse.json({ item: updated });
  }
  if (status.failed) {
    const updated = await updateReel(id, { renderStatus: "failed", renderError: status.errorDetail });
    return NextResponse.json({ item: updated });
  }
  return NextResponse.json({ item: reel });
}
