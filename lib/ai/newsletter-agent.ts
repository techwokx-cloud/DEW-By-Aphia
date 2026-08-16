import OpenAI from "openai";
import { getAllProducts } from "@/lib/products-data";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface EmailDraft {
  subject: string;
  body: string;
  source: "groq" | "fallback";
}

const SYSTEM_PROMPT = `You write short marketing emails for DEW by Aphia, a luxury Ghanaian
wax-print and Ankara womenswear house. Warm, confident, never salesy. Given a featured
product, write a short subject line and a 3-4 sentence email body inviting subscribers to
shop it, mentioning it's made to order with a 50% deposit and 10-14 day turnaround. Respond
with ONLY JSON: {"subject": string, "body": string} — no markdown.`;

function fallbackEmail(): EmailDraft {
  const product = getAllProducts()[0];
  return {
    subject: `New at DEW: ${product.name}`,
    body: `Hello beautiful,\n\nWe just added the ${product.name} to the archive — cut from ${product.fabric.toLowerCase()}, made to order in your size. Like everything at DEW, it starts with a 50% deposit and takes 10-14 working days to make.\n\nReply or message us on WhatsApp to start yours.\n\nWith love,\nDEW by Aphia`,
    source: "fallback",
  };
}

export async function generateNewsletterDraft(): Promise<EmailDraft> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return fallbackEmail();

  try {
    const product = getAllProducts()[Math.floor(Math.random() * getAllProducts().length)];
    const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Product: ${product.name}\nFabric: ${product.fabric}\nPrice: $${product.price}\nDescription: ${product.description}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallbackEmail();
    const parsed = JSON.parse(raw) as { subject: string; body: string };
    return { subject: parsed.subject, body: parsed.body, source: "groq" };
  } catch (err) {
    console.error("Newsletter agent Groq call failed, using fallback:", err);
    return fallbackEmail();
  }
}
