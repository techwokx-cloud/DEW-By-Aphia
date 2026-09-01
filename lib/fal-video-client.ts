import { getFalApiKey } from "@/lib/store/settings";

const QUEUE_BASE = "https://queue.fal.run";
// Kling 1.6 standard image-to-video — a reasonable cost/quality balance
// among fal.ai's video models as of this writing. Costs real money per
// generation (roughly $0.10-0.30/sec of output depending on the model
// fal.ai has live) — this is NOT free like the Ken Burns pan/zoom
// (lib/json2video-client.ts), which is why it's an explicit opt-in
// rather than the default.
const MODEL = "fal-ai/kling-video/v1/standard/image-to-video";

interface VideoResult {
  ok: boolean;
  videoUrl?: string;
  error?: string;
}

/**
 * Submits an image-to-video generation job and polls until it completes
 * or the timeout is hit. This is genuinely slow (real AI video rendering
 * takes anywhere from ~20s to a few minutes) — capped at 2 minutes here
 * so a reel-generation request doesn't hang indefinitely. If it times
 * out, the caller should fall back to the free Ken Burns pan/zoom rather
 * than fail the whole reel.
 */
export async function generateImageToVideo(imageUrl: string, motionPrompt: string): Promise<VideoResult> {
  const apiKey = getFalApiKey();
  if (!apiKey) return { ok: false, error: "not_configured" };

  try {
    const submitRes = await fetch(`${QUEUE_BASE}/${MODEL}`, {
      method: "POST",
      headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: motionPrompt,
        duration: "5",
      }),
    });
    const submitData = await submitRes.json().catch(() => ({}));
    if (!submitRes.ok || !submitData.status_url) {
      return { ok: false, error: submitData?.detail || `Submit failed: HTTP ${submitRes.status}` };
    }

    const statusUrl = submitData.status_url as string;
    const responseUrl = submitData.response_url as string;

    const deadline = Date.now() + 120_000; // 2 minute cap
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 4000));
      const statusRes = await fetch(statusUrl, { headers: { Authorization: `Key ${apiKey}` } });
      const statusData = await statusRes.json().catch(() => ({}));

      if (statusData.status === "COMPLETED") {
        const resultRes = await fetch(responseUrl, { headers: { Authorization: `Key ${apiKey}` } });
        const resultData = await resultRes.json().catch(() => ({}));
        const videoUrl = resultData?.video?.url;
        if (videoUrl) return { ok: true, videoUrl };
        return { ok: false, error: "Completed but no video URL in response" };
      }
      if (statusData.status === "ERROR" || statusData.status === "FAILED") {
        return { ok: false, error: statusData?.error || "Generation failed" };
      }
      // IN_QUEUE / IN_PROGRESS — keep polling
    }

    return { ok: false, error: "Timed out waiting for video generation (>2 min)" };
  } catch (err) {
    console.error("fal.ai image-to-video generation failed:", err);
    return { ok: false, error: String(err) };
  }
}
