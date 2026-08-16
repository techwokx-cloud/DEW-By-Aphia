import type { ReelScript } from "@/lib/ai/reel-script-agent";

export interface ReelDraft {
  id: string;
  productName: string;
  script: ReelScript;
  videoUrl: string | null;
  renderProjectId: string | null;
  renderStatus: "not_configured" | "pending" | "ready" | "failed";
  renderError?: string;
  status: "draft" | "approved" | "rejected" | "posted";
  createdAt: string;
}

const QUEUE: ReelDraft[] = [];

export function listReels(): ReelDraft[] {
  return [...QUEUE].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getReel(id: string): ReelDraft | undefined {
  return QUEUE.find((r) => r.id === id);
}

export function addReel(input: Omit<ReelDraft, "id" | "createdAt" | "status">): ReelDraft {
  const reel: ReelDraft = {
    ...input,
    id: `reel_${Date.now()}`,
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  QUEUE.push(reel);
  return reel;
}

export function updateReel(id: string, patch: Partial<ReelDraft>): ReelDraft | null {
  const reel = getReel(id);
  if (!reel) return null;
  Object.assign(reel, patch);
  return reel;
}
