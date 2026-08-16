import OpenAI from "openai";
import type { Product } from "@/lib/types";
import type { ContentPost } from "@/lib/store/content-queue";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface CaptionDraft {
  caption: string;
  hashtags: string[];
  source: "groq" | "fallback";
}

type ContentType = ContentPost["contentType"];

const TYPE_BRIEF: Record<ContentType, string> = {
  education:
    "an educational post — teach something real about wax print/Ankara fabric, dressmaking, or African fashion heritage, tying it back to the product only briefly at the end",
  quiz:
    "a quiz/interactive post — ask a fun either/or or multiple-choice style question about style preferences that invites comments, referencing the product as one of the options",
  engagement:
    "a comment-bait engagement post — ask an opinion question or invite people to tag a friend, using the product as the visual hook",
  promo:
    "a direct promotional post — clearly invite people to shop the product, mention it's made to order with a 50% deposit and 10-14 day turnaround",
};

const SYSTEM_PROMPT = `You write Instagram captions for DEW by Aphia, a luxury Ghanaian
wax-print and Ankara womenswear house (voice: warm, confident, a little poetic, never
salesy or full of emoji spam except where the post type calls for a direct promo). The brand
ships worldwide and is actively growing its US, UK, and Australian customer base, so mention
worldwide shipping naturally where it fits and lean into hashtags the African diaspora
searches and follows — not just brand tags.
Given one product and a post type, write ONE caption (2-4 sentences, max 2 tasteful emoji)
matching that post type, plus 8-12 hashtags mixing: brand tags, general African-fashion
tags, and diaspora/international-audience tags (e.g. africanfashionusa, africanfashionuk,
blackownedbusiness, africandiaspora, ankarastyle — pick what actually fits, don't force all
of them). Respond with ONLY JSON: {"caption": string, "hashtags": string[]} — no markdown.`;

function fallbackCaption(product: Product, type: ContentType): CaptionDraft {
  const captions: Record<ContentType, string> = {
    education: `Did you know? Authentic wax print starts as plain cotton, hand-stamped with wax and dyed in stages — every yard is one of a kind. The ${product.name} carries that tradition forward. ✨`,
    quiz: `Boardroom or bridal? 👗 Tell us which DEW mood matches your week — the ${product.name} says "I run this meeting."`,
    engagement: `Tag the friend who'd wear the ${product.name} to closing a deal AND to Sunday brunch. We'll wait. ✨`,
    promo: `Meet the ${product.name} — cut from ${product.fabric.toLowerCase()}, made to order in your size. 50% deposit, 10-14 days, yours to keep forever.`,
  };
  return {
    caption: captions[type],
    hashtags: [
      "dewbyaphia",
      "ankarafashion",
      "waxprint",
      "africanfashion",
      "ghanafashion",
      product.category.replace("-", ""),
      "africanfashionusa",
      "blackownedbusiness",
      "madeinghana",
      "shipsworldwide",
    ],
    source: "fallback",
  };
}

export async function generateCaption(product: Product, type: ContentType = "promo"): Promise<CaptionDraft> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return fallbackCaption(product, type);

  try {
    const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Post type: ${type} — ${TYPE_BRIEF[type]}\n\nProduct: ${product.name}\nCategory: ${product.category}\nFabric: ${product.fabric}\nPrice: $${product.price}\nDescription: ${product.description}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallbackCaption(product, type);
    const parsed = JSON.parse(raw) as { caption: string; hashtags: string[] };
    return { caption: parsed.caption, hashtags: parsed.hashtags ?? [], source: "groq" };
  } catch (err) {
    console.error("Content agent Groq call failed, using fallback:", err);
    return fallbackCaption(product, type);
  }
}

export async function generateOccasionCaption(
  product: Product,
  occasionName: string,
  occasionNote: string
): Promise<CaptionDraft> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      caption: `${occasionName} is coming — celebrate it in the ${product.name}. Made to order, 50% deposit, 10-14 days. ✨`,
      hashtags: ["dewbyaphia", "ghana", occasionName.toLowerCase().replace(/[^a-z0-9]/g, ""), "africanfashion", "waxprint"],
      source: "fallback",
    };
  }

  try {
    const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Post type: promo, tied to the Ghanaian occasion "${occasionName}" (${occasionNote}). Reference the occasion naturally.\n\nProduct: ${product.name}\nCategory: ${product.category}\nFabric: ${product.fabric}\nPrice: $${product.price}\nDescription: ${product.description}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallbackCaption(product, "promo");
    const parsed = JSON.parse(raw) as { caption: string; hashtags: string[] };
    return { caption: parsed.caption, hashtags: parsed.hashtags ?? [], source: "groq" };
  } catch (err) {
    console.error("Occasion caption Groq call failed, using fallback:", err);
    return fallbackCaption(product, "promo");
  }
}
