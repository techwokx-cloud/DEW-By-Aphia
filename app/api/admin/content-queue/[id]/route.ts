import { NextRequest, NextResponse } from "next/server";
import { listContentPosts, updateContentPost } from "@/lib/store/content-queue";
import { publishInstagramPost } from "@/lib/instagram-client";
import { publishFacebookPost } from "@/lib/facebook-client";
import { publishThreadsPost } from "@/lib/threads-client";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "approve") {
    const existing = listContentPosts().find((p) => p.id === id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const imageUrl = new URL(existing.image, request.nextUrl.origin).toString();
    const captionWithTags = `${existing.caption}\n\n${existing.hashtags.map((h) => `#${h}`).join(" ")}`;

    // Publish to all three platforms in parallel — each is independently
    // inert (no-op) until its own credentials are configured, so this is
    // safe to call even with zero platforms connected yet.
    const [instagram, facebook, threads] = await Promise.all([
      publishInstagramPost(imageUrl, captionWithTags),
      publishFacebookPost(imageUrl, captionWithTags),
      publishThreadsPost(captionWithTags, imageUrl),
    ]);

    const anySent = instagram.sent || facebook.sent || threads.sent;
    const post = updateContentPost(id, { status: anySent ? "posted" : "approved" });
    return NextResponse.json({ item: post, instagram, facebook, threads });
  }

  if (body.action === "reject") {
    const post = updateContentPost(id, { status: "rejected" });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: post });
  }

  // Plain edit (caption/hashtags tweak before approval)
  const post = updateContentPost(id, {
    caption: body.caption,
    hashtags: body.hashtags,
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: post });
}
