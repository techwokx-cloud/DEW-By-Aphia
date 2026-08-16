"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, Video, ImageIcon } from "lucide-react";
import type { MediaItem } from "@/lib/store/media-library";

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/admin/media").then((r) => r.json()).then((d) => setItems(d.items ?? []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("windowDays", "7");
    await fetch("/api/admin/media", { method: "POST", body: form });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  function rotationStatus(item: MediaItem): { label: string; color: string } {
    if (!item.lastUsedAt) return { label: "Ready to use", color: "text-green-700 bg-green-100" };
    const daysSince = (Date.now() - new Date(item.lastUsedAt).getTime()) / 86400000;
    if (daysSince < 30) {
      return { label: `Used ${Math.floor(daysSince)}d ago — resting`, color: "text-gold bg-gold/10" };
    }
    return { label: "Ready to use again", color: "text-green-700 bg-green-100" };
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-3xl text-ink">Media Library</h1>
        <label className="flex items-center gap-2 bg-primary text-cream px-5 py-2.5 text-sm tracking-[0.05em] uppercase hover:bg-primary-deep transition-colors cursor-pointer">
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} strokeWidth={2} />}
          Upload
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      <p className="text-ink-soft text-sm mb-8">
        {items.length} items in rotation · new uploads are prioritized for their first 7 days,
        then join the general pool · nothing repeats within 30 days of last use
      </p>

      <div className="rounded-md border border-gold/40 bg-gold/[0.06] px-4 py-3 mb-8">
        <p className="text-xs text-ink-soft leading-relaxed">
          Uploaded files are stored on this server's disk, which is ephemeral on most Render
          plans — they'll survive as long as the app stays running, but not a redeploy. For
          permanent storage, connect Cloudinary (already in the original tech plan).
        </p>
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const status = rotationStatus(item);
          return (
            <div key={item.id} className="border border-line rounded-[var(--radius)] bg-white overflow-hidden">
              <div className="relative aspect-square bg-primary/5">
                {item.type === "video" ? (
                  <video src={item.url} className="h-full w-full object-cover" muted />
                ) : (
                  <Image src={item.url} alt="" fill className="object-cover" />
                )}
                <span className="absolute top-2 left-2 h-6 w-6 rounded-full bg-white/90 flex items-center justify-center text-ink">
                  {item.type === "video" ? <Video size={12} strokeWidth={2} /> : <ImageIcon size={12} strokeWidth={2} />}
                </span>
              </div>
              <div className="p-2.5">
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
