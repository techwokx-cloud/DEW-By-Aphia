import OpenAI from "openai";
import { getAllProducts } from "@/lib/products-data";
import { WHATSAPP_NUMBER } from "@/lib/business-info";
import type { Product } from "@/lib/types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StylistReply {
  reply: string;
  recommendations: Product[];
  outOfScope: boolean;
  source: "groq" | "fallback";
}

// Groq (console.groq.com) offers a genuinely free tier — no credit card,
// generous daily limits — running open-source models through an
// OpenAI-compatible API, so the same `openai` SDK works by just pointing
// baseURL at Groq instead of OpenAI.
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are the DEW by Aphia AI Stylist — a warm, confident fashion consultant for
La Maison du Mode dew, a luxury Ghanaian wax-print and Ankara womenswear house in Accra, Ghana.

SCOPE: DEW currently sells women's wear only (Executive Wear, Evening Wear, Bridal, Corporate
Chic, Accessories). You can also answer general questions about the brand, orders, sizing,
shipping, and the made-to-order process: all dresses are made to order in the customer's size,
require a 50% deposit with the balance due on pickup/shipment, and take 10-14 working days.
Website orders have a delivery fee.

If asked something outside this scope (menswear, kidswear, wholesale, anything you're unsure
of, or a complaint that needs a human), give a brief, warm answer acknowledging what you do
know if relevant, then say you'll direct them to the team on WhatsApp — set out_of_scope to
true in that case. Example: asked "do you have designs for men?" reply along the lines of "Our
current catalog features women's luxury Ghanaian wax-print and Ankara wear. What occasion are
you shopping for?" and set out_of_scope true so they see a WhatsApp handoff link.

Speak in 2-4 concise sentences. Recommend real pieces only from the catalog you're given —
never invent products. Respond with ONLY a JSON object of the shape
{"reply": string, "recommended_product_ids": string[], "out_of_scope": boolean} — no markdown,
no commentary outside the JSON. If the occasion is unclear but still in scope, ask one short
clarifying question and leave recommended_product_ids empty and out_of_scope false.`;

function buildCatalogContext(): string {
  return getAllProducts()
    .map((p) => `- id:${p.id} | ${p.name} | ${p.category} | $${p.price} | ${p.fabric}`)
    .join("\n");
}

/** Very small keyword router used when no GROQ_API_KEY is configured, so the
 * demo stays fully functional offline (e.g. in this sandbox, or before the
 * key is added in Render). */
function fallbackReply(messages: ChatMessage[]): StylistReply {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content.toLowerCase() ?? "";
  const catalog = getAllProducts();

  const rules: { keywords: string[]; category: Product["category"]; line: string }[] = [
    {
      keywords: ["boardroom", "executive", "corporate", "office", "work", "meeting"],
      category: "executive-wear",
      line: "For the boardroom, I'd steer you toward our Executive Wear — structured, powerful, and unmistakably DEW.",
    },
    {
      keywords: ["wedding", "bride", "bridal", "aisle"],
      category: "bridal",
      line: "For a wedding, our Bridal line reworks wax print into something timeless — here's where I'd start.",
    },
    {
      keywords: ["evening", "gala", "party", "event", "dinner"],
      category: "evening-wear",
      line: "For an evening event, you want a piece that walks into the room last — try these.",
    },
    {
      keywords: ["accessor", "clutch", "earring", "headwrap", "gele"],
      category: "accessories",
      line: "Sounds like you're finishing a look — these accessories carry the print without overwhelming it.",
    },
  ];

  // Out-of-scope: menswear / kidswear specifically called out per brand guidance
  if (/\b(men'?s?|man'?s?|male|boy'?s?|kid'?s?|children'?s?)\b/.test(lastUser)) {
    return {
      reply: "Our current catalog features women's luxury Ghanaian wax-print and Ankara wear. What occasion are you shopping for?",
      recommendations: [],
      outOfScope: true,
      source: "fallback",
    };
  }

  // Generic catch-all for anything that isn't a recognized styling question —
  // after two exchanges with no match, hand off rather than loop.
  const userTurns = messages.filter((m) => m.role === "user").length;
  const match = rules.find((r) => r.keywords.some((k) => lastUser.includes(k)));

  if (!match) {
    if (userTurns >= 2) {
      return {
        reply: "I'm not able to help with that one — let me direct you to our human staff who can.",
        recommendations: [],
        outOfScope: true,
        source: "fallback",
      };
    }
    return {
      reply: "Tell me a bit more about the occasion — is this for the boardroom, a wedding, an evening event, or something else?",
      recommendations: [],
      outOfScope: false,
      source: "fallback",
    };
  }

  const recommendations = catalog.filter((p) => p.category === match.category).slice(0, 3);
  return { reply: match.line, recommendations, outOfScope: false, source: "fallback" };
}

export async function getStylistReply(messages: ChatMessage[]): Promise<StylistReply> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fallbackReply(messages);
  }

  try {
    const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n\nCatalog:\n${buildCatalogContext()}\n\nHuman staff WhatsApp: ${WHATSAPP_NUMBER}`,
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallbackReply(messages);

    const parsed = JSON.parse(raw) as {
      reply: string;
      recommended_product_ids: string[];
      out_of_scope?: boolean;
    };
    const catalog = getAllProducts();
    const recommendations = (parsed.recommended_product_ids ?? [])
      .map((id) => catalog.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));

    return {
      reply: parsed.reply,
      recommendations,
      outOfScope: Boolean(parsed.out_of_scope),
      source: "groq",
    };
  } catch (err) {
    console.error("Groq stylist call failed, using fallback:", err);
    return fallbackReply(messages);
  }
}
