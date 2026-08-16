import OpenAI from "openai";
import { getAllProducts } from "@/lib/products-data";
import type { DMMessage } from "@/lib/store/leads";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface DMReplyDraft {
  reply: string;
  suggestedStatus: "new" | "engaged" | "qualified" | "won" | "lost";
  source: "groq" | "fallback";
}

const SYSTEM_PROMPT = `You draft Instagram DM replies for DEW by Aphia, a luxury Ghanaian
wax-print and Ankara womenswear house. You are warm, concise (2-3 sentences), and focused
on understanding the lead's occasion and moving them toward a purchase or a consultation
booking — never pushy. Never invent products outside the catalog given. Every reply you
write is a DRAFT for a human to review and send — you are not sending it yourself.
Respond with ONLY JSON: {"reply": string, "suggested_status": "new"|"engaged"|"qualified"|"won"|"lost"}`;

function buildCatalogContext(): string {
  return getAllProducts()
    .slice(0, 12)
    .map((p) => `- ${p.name} (${p.category}, $${p.price})`)
    .join("\n");
}

function fallbackReply(messages: DMMessage[]): DMReplyDraft {
  const lastLead = [...messages].reverse().find((m) => m.from === "lead")?.text.toLowerCase() ?? "";
  if (!lastLead) {
    return {
      reply: "Hi! Thanks for reaching out to DEW by Aphia ✨ What occasion are you shopping for?",
      suggestedStatus: "new",
      source: "fallback",
    };
  }
  if (/price|cost|how much/.test(lastLead)) {
    return {
      reply: "Our pieces range from $65 accessories to $1,240 bridal gowns — happy to point you to something in your range. What's the occasion?",
      suggestedStatus: "engaged",
      source: "fallback",
    };
  }
  return {
    reply: "That sounds lovely — I'd love to help you find the right piece. Want to book a quick consultation so our stylist can walk you through options?",
    suggestedStatus: "engaged",
    source: "fallback",
  };
}

export async function generateDMReply(messages: DMMessage[]): Promise<DMReplyDraft> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return fallbackReply(messages);

  try {
    const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\nCatalog:\n${buildCatalogContext()}` },
        ...messages.map((m) => ({
          role: (m.from === "lead" ? "user" : "assistant") as "user" | "assistant",
          content: m.text,
        })),
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallbackReply(messages);
    const parsed = JSON.parse(raw) as { reply: string; suggested_status: DMReplyDraft["suggestedStatus"] };
    return { reply: parsed.reply, suggestedStatus: parsed.suggested_status ?? "engaged", source: "groq" };
  } catch (err) {
    console.error("DM agent Groq call failed, using fallback:", err);
    return fallbackReply(messages);
  }
}
