import OpenAI from "openai";
import type { AdObjective } from "@/lib/store/seed-ads";
import type { Lead } from "@/lib/store/leads";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "openai/gpt-oss-120b"; // llama-3.3-70b-versatile deprecated by Groq June 2026

export interface AdStrategyDecision {
  objective: AdObjective;
  reasoning: string;
  /** True when there's a meaningful backlog of unconverted leads worth a
   * human following up on directly, separate from whatever ad runs. */
  suggestLeadFollowUp: boolean;
  source: "groq" | "fallback";
}

const CYCLE: AdObjective[] = ["engagement", "leads", "reach"];

function fallback(lastObjective: AdObjective | null, staleLeadCount: number): AdStrategyDecision {
  const lastIndex = lastObjective ? CYCLE.indexOf(lastObjective) : -1;
  const objective = CYCLE[(lastIndex + 1) % CYCLE.length];
  return {
    objective,
    reasoning: "Rotated to the next objective in sequence (engagement → leads → reach).",
    suggestLeadFollowUp: staleLeadCount >= 5,
    source: "fallback",
  };
}

/**
 * Decides this month's seed ad objective using real pipeline signal
 * instead of a blind rotation: if there's a real backlog of unconverted
 * leads, a "leads" or "engagement" push may matter more than "reach"
 * regardless of whose turn it is in the cycle. Falls back to the plain
 * rotation (still a reasonable default) if Groq is unavailable.
 */
export async function decideAdStrategy(params: {
  lastObjective: AdObjective | null;
  leads: Lead[];
}): Promise<AdStrategyDecision> {
  const staleLeadCount = params.leads.filter((l) => l.status === "new" || l.status === "engaged").length;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return fallback(params.lastObjective, staleLeadCount);

  try {
    const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `You decide which Meta Ads objective a small fashion brand's monthly $10
seed ad should use: "engagement", "leads", or "reach". Consider: how many unconverted
leads are already in the pipeline (a lot = maybe push "leads" or "engagement" to convert
them rather than "reach" for brand-new cold traffic), and which objective was used last
month (avoid using the exact same one twice in a row unless the lead backlog strongly
justifies it). Respond with ONLY JSON:
{"objective": "engagement"|"leads"|"reach", "reasoning": string (one sentence), "suggestLeadFollowUp": boolean}`,
        },
        {
          role: "user",
          content: `Last month's objective: ${params.lastObjective ?? "none yet"}\nUnconverted leads in pipeline (status new or engaged): ${staleLeadCount}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallback(params.lastObjective, staleLeadCount);
    const parsed = JSON.parse(raw) as { objective: AdObjective; reasoning: string; suggestLeadFollowUp: boolean };
    if (!CYCLE.includes(parsed.objective)) return fallback(params.lastObjective, staleLeadCount);
    return { ...parsed, source: "groq" };
  } catch (err) {
    console.error("Ad strategy agent Groq call failed, using fallback:", err);
    return fallback(params.lastObjective, staleLeadCount);
  }
}
