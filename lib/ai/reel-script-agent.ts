import OpenAI from "openai";
import type { Product } from "@/lib/types";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface ReelBeat {
  text: string;
}

export interface ReelScript {
  hook: string;
  beats: ReelBeat[];
  voiceoverLine: string;
  caption: string;
  hashtags: string[];
  source: "groq" | "fallback";
}

const SYSTEM_PROMPT = `You write short-form Instagram Reel scripts for DEW by Aphia, a luxury
Ghanaian wax-print and Ankara womenswear house. Given one product, write:
- hook: one punchy on-screen line for the first 2 seconds (max 8 words)
- beats: 3 short on-screen text lines that follow the hook (max 8 words each)
- voiceoverLine: one sentence a founder/stylist could read aloud over the reel
- caption: a 2-3 sentence Instagram caption
- hashtags: 8-12 relevant tags
Respond with ONLY JSON: {"hook": string, "beats": [string, string, string],
"voiceoverLine": string, "caption": string, "hashtags": string[]} — no markdown.
This is a script for a human to film — do not claim it will "go viral" or promise results.`;

function fallbackScript(product: Product): ReelScript {
  return {
    hook: `POV: your ${product.category.replace("-", " ")} finally fits right`,
    beats: [
      { text: `Cut from ${product.fabric.toLowerCase()}` },
      { text: "Made to order, in your size" },
      { text: "50% deposit · 10-14 days" },
    ],
    voiceoverLine: `This is the ${product.name} — made to order, made for you.`,
    caption: `The ${product.name} — made to order in your size. DM us or WhatsApp to start yours. ✨`,
    hashtags: ["dewbyaphia", "ankarafashion", "waxprint", "africanfashion", "ghanafashion", "madeinghana", "luxuryfashion", "ootd"],
    source: "fallback",
  };
}

export async function generateReelScript(product: Product): Promise<ReelScript> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return fallbackScript(product);

  try {
    const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Product: ${product.name}\nCategory: ${product.category}\nFabric: ${product.fabric}\nPrice: $${product.price}\nDescription: ${product.description}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallbackScript(product);
    const parsed = JSON.parse(raw) as {
      hook: string;
      beats: string[];
      voiceoverLine: string;
      caption: string;
      hashtags: string[];
    };
    return {
      hook: parsed.hook,
      beats: parsed.beats.map((b) => ({ text: b })),
      voiceoverLine: parsed.voiceoverLine,
      caption: parsed.caption,
      hashtags: parsed.hashtags ?? [],
      source: "groq",
    };
  } catch (err) {
    console.error("Reel script agent Groq call failed, using fallback:", err);
    return fallbackScript(product);
  }
}
