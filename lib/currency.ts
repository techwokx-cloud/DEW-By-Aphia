/**
 * DEW displays and quotes everything in USD (for its international
 * customers), but the actual Paystack charge happens in GHS — Ghana-
 * registered Paystack accounts reliably settle in GHS, while USD support
 * requires special account enablement that isn't guaranteed to be on.
 * So: show USD everywhere, convert right before the actual charge, and
 * show the customer the GHS amount they're about to pay before they
 * confirm — never a silent conversion.
 */

interface CachedRate {
  rate: number;
  fetchedAt: number;
}

let cache: CachedRate | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours — this rate doesn't need to be second-fresh

// Only used if the live API is genuinely unreachable — logged loudly
// whenever it's hit, since a stale hardcoded rate should be rare, not
// normal operation. Update this occasionally so it stays roughly sane
// even in the worst case.
const EMERGENCY_FALLBACK_RATE = 15.5;

/** Returns how many GHS one USD buys right now. Cached for 6 hours to
 * avoid hammering the free API on every checkout. */
export async function getUsdToGhsRate(): Promise<number> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rate;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    const rate = data?.rates?.GHS;
    if (data.result === "success" && typeof rate === "number" && rate > 0) {
      cache = { rate, fetchedAt: Date.now() };
      return rate;
    }
    throw new Error(`Unexpected response shape: ${JSON.stringify(data).slice(0, 200)}`);
  } catch (err) {
    console.error(
      `USD->GHS live rate fetch failed, using emergency fallback (${EMERGENCY_FALLBACK_RATE}). ` +
      `This should be rare — investigate if it's happening often:`,
      err
    );
    return EMERGENCY_FALLBACK_RATE;
  }
}

export interface DepositConversion {
  usdAmount: number;
  ghsAmount: number;
  rate: number;
}

/** Converts a USD deposit amount to GHS for the actual Paystack charge,
 * rounded to 2 decimal places (GHS pesewas). */
export async function convertUsdDepositToGhs(usdAmount: number): Promise<DepositConversion> {
  const rate = await getUsdToGhsRate();
  const ghsAmount = Math.round(usdAmount * rate * 100) / 100;
  return { usdAmount, ghsAmount, rate };
}
