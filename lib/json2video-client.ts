/**
 * Renders an actual MP4 reel from a script + images via json2video's cloud
 * renderer. Real integration; inert (returns { started: false, reason:
 * "not_configured" }) until a key is set (Settings, or JSON2VIDEO_API_KEY
 * env var). Get a key at https://json2video.com — they have a free tier.
 *
 * Rendering is async: submitReelRender() kicks off a job and returns a
 * project ID immediately; checkRenderStatus() polls it. The admin Reels
 * page polls every few seconds until the video URL is ready.
 */
import { getJson2videoApiKey } from "@/lib/store/settings";

const BASE_URL = "https://api.json2video.com/v2";

export interface ReelScene {
  imageUrl: string;
  /** Optional AI-generated video clip (fal.ai image-to-video) to use
   * instead of the static image + Ken Burns pan/zoom for this scene. */
  videoUrl?: string;
  text: string;
  voiceoverLine?: string;
  durationSeconds: number;
}

export interface SubmitResult {
  started: boolean;
  projectId?: string;
  reason?: "not_configured" | "api_error";
  errorDetail?: string;
}

/** Ken Burns moves to rotate through so scenes don't all move the same
 * way — JSON2Video's image element supports zoom (-10 to 10) and pan
 * (direction) natively, no extra API calls or cost, unlike AI video
 * generation. This alone turns a "static photo with text on top" into an
 * actually moving shot. */
const KEN_BURNS_MOVES: { zoom: number; pan: string }[] = [
  { zoom: 3, pan: "left" },
  { zoom: -3, pan: "right" },
  { zoom: 2, pan: "top" },
  { zoom: -2, pan: "bottom" },
  { zoom: 4, pan: "top-left" },
  { zoom: -3, pan: "bottom-right" },
];

export async function submitReelRender(scenes: ReelScene[]): Promise<SubmitResult> {
  const apiKey = getJson2videoApiKey();
  if (!apiKey) return { started: false, reason: "not_configured" };

  const movie = {
    resolution: "instagram-story",
    quality: "high",
    scenes: scenes.map((scene, i) => {
      const move = KEN_BURNS_MOVES[i % KEN_BURNS_MOVES.length];
      return {
        elements: [
          scene.videoUrl
            ? { type: "video", src: scene.videoUrl, duration: scene.durationSeconds, resize: "cover", muted: true }
            : {
                type: "image",
                src: scene.imageUrl,
                duration: scene.durationSeconds,
                resize: "cover",
                zoom: move.zoom,
                pan: move.pan,
                "pan-distance": 0.15,
              },
          {
            type: "text",
            text: scene.text,
            duration: scene.durationSeconds,
            settings: { "font-size": "5vw", color: "#f8f5f0", "text-align": "center" },
            position: "bottom-center",
          },
          // Azure TTS via JSON2Video's managed service — free on all plans,
          // no separate Azure account needed. See lib/ai/reel-script-agent.ts
          // for where voiceoverLine is generated (a distinct sentence from
          // the on-screen `text`, meant to be spoken rather than read).
          ...(scene.voiceoverLine
            ? [{
                type: "voice" as const,
                text: scene.voiceoverLine,
                voice: "en-US-EmmaMultilingualNeural",
                model: "azure" as const,
              }]
            : []),
        ],
      };
    }),
  };

  try {
    const res = await fetch(`${BASE_URL}/movies`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(movie),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = data?.message || JSON.stringify(data);
      console.error("json2video render submission failed:", res.status, detail);
      return { started: false, reason: "api_error", errorDetail: `${res.status}: ${detail}` };
    }
    return { started: true, projectId: data.project };
  } catch (err) {
    console.error("json2video request failed:", err);
    return { started: false, reason: "api_error", errorDetail: String(err) };
  }
}

export interface RenderStatus {
  done: boolean;
  videoUrl: string | null;
  failed: boolean;
  errorDetail?: string;
}

export async function checkRenderStatus(projectId: string): Promise<RenderStatus> {
  const apiKey = getJson2videoApiKey();
  if (!apiKey) return { done: false, videoUrl: null, failed: true, errorDetail: "not_configured" };

  try {
    const res = await fetch(`${BASE_URL}/movies?project=${encodeURIComponent(projectId)}`, {
      headers: { "x-api-key": apiKey },
    });
    if (!res.ok) return { done: false, videoUrl: null, failed: true, errorDetail: `HTTP ${res.status}` };
    const data = await res.json();
    const movie = data.movie ?? data;
    if (movie?.status === "done" && movie?.url) return { done: true, videoUrl: movie.url, failed: false };
    if (movie?.status === "error") {
      return { done: true, videoUrl: null, failed: true, errorDetail: movie?.message || "render error" };
    }
    return { done: false, videoUrl: null, failed: false };
  } catch (err) {
    console.error("json2video status check failed:", err);
    return { done: false, videoUrl: null, failed: true, errorDetail: String(err) };
  }
}

export const json2videoConfigured = () => Boolean(getJson2videoApiKey());
