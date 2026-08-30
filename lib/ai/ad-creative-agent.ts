import OpenAI from "openai";
import type { AdObjective } from "@/lib/store/seed-ads";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "openai/gpt-oss-120b"; // llama-3.3-70b-versatile deprecated by Groq June 2026

export interface AdCreativeDraft {
  headline: string;
  primaryText: string;
  source: "groq" | "fallback";
}

const OBJECTIVE_BRIEF: Record<AdObjective, string> = {
  engagement:
    "an engagement ad — write copy that invites comments/shares (ask a question, invite people to tag a friend who'd love this)",
  leads:
    "a lead-generation ad — write copy that makes booking a consultation or starting a custom order feel like the obvious next step",
  reach:
    "a broad-reach brand-awareness ad — write copy that introduces DEW by Aphia's world to someone seeing the brand for the first time",
};

const FALLBACK: Record<AdObjective, AdCreativeDraft> = {
  engagement: {
    headline: "Which one is you? 👇",
    primaryText:
      "Ghanaian wax prints, cut for the modern woman. Tell us your favourite silhouette in the comments — we read every one. ✨",
    source: "fallback",
  },
  leads: {
    headline: "Made to Order, Made for You",
    primaryText:
      "Every DEW by Aphia piece is cut and fitted to you — 10-14 days, 50% deposit. Book a free styling consultation to start yours.",
    source: "fallback",
  },
  reach: {
    headline: "Bold Heritage. Timeless Elegance.",
    primaryText:
      "DEW by Aphia — exquisite Ghanaian wax prints and Ankara designs, crafted for the modern woman of class. Discover the collection.",
    source: "fallback",
  },
};

const SYSTEM_PROMPT = `You write Meta Ads copy for DEW by Aphia, a luxury Ghanaian wax-print and
Ankara womenswear house. Given an objective, write:
- headline: max 40 characters, punchy
- primaryText: 1-3 sentences, max 125 characters, matches the objective's goal
Respond with ONLY JSON: {"headline": string, "primaryText": string} — no markdown.
This is a paid ad — be direct and inviting, not salesy or hyperbolic. Never promise
specific results, discounts, or timelines you weren't given.`;

export async function generateAdCreative(objective: AdObjective): Promise<AdCreativeDraft> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return FALLBACK[objective];

  try {
    const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Objective: ${OBJECTIVE_BRIEF[objective]}` },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return FALLBACK[objective];
    const parsed = JSON.parse(raw) as { headline: string; primaryText: string };
    if (!parsed.headline || !parsed.primaryText) return FALLBACK[objective];
    return { headline: parsed.headline, primaryText: parsed.primaryText, source: "groq" };
  } catch (err) {
    console.error("Ad creative agent Groq call failed, using fallback:", err);
    return FALLBACK[objective];
  }
}
