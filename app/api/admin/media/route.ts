import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { listMedia, addMedia } from "@/lib/store/media-library";

export async function GET() {
  return NextResponse.json({ items: listMedia() });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  const windowDays = Number(form.get("windowDays") ?? "7");

  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/");
  const ext = file.type.split("/")[1] || (isVideo ? "mp4" : "jpg");
  const filename = `upload_${Date.now()}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadsDir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), bytes);
  } catch (err) {
    console.error("Media upload write failed:", err);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }

  const item = addMedia({
    url: `/uploads/${filename}`,
    type: isVideo ? "video" : "image",
    windowDays,
  });

  return NextResponse.json({ item }, { status: 201 });
}
