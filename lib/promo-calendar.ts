export type Region = "ghana" | "us" | "canada" | "europe" | "global" | "china" | "middle-east" | "mexico";

export interface PromoOccasion {
  id: string;
  name: string;
  regions: Region[];
  note: string;
  /** Fixed-date occasions: month (1-12) + day. */
  month?: number;
  day?: number;
  /** Computed-date occasions (e.g. "4th Thursday of November") — used
   * instead of month/day for anything rule-based rather than a fixed
   * calendar date. Not for lunar/ecclesiastical dates like Easter, which
   * need real astronomical calculation to place correctly rather than a
   * simple day-of-week rule — those are intentionally left out rather
   * than guessed. */
  compute?: (year: number) => Date;
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  // month: 1-12, weekday: 0=Sun..6=Sat, n: 1st/2nd/3rd/4th occurrence
  const first = new Date(year, month - 1, 1);
  const firstWeekday = first.getDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  return new Date(year, month - 1, 1 + offset + (n - 1) * 7);
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month, 0); // day 0 of next month = last day of this month
  const lastWeekday = lastDay.getDay();
  const offset = (lastWeekday - weekday + 7) % 7;
  return new Date(year, month - 1, lastDay.getDate() - offset);
}

/**
 * The Crimtan "16 biggest online shopping events" list (the canonical
 * source for "the 16 biggest") has 4 entries that are genuinely
 * lunar/lunisolar-calendar events — Ramadan, Easter, Diwali, and Chinese
 * New Year — the same category as the existing Easter exclusion above.
 * These need real astronomical/ecclesiastical calculation to place
 * correctly, not a day-of-week rule, so they're intentionally left out
 * here rather than guessed at. Worth adding properly later via a proper
 * lunar calendar library/API if these markets matter for the brand.
 */

export const PROMO_OCCASIONS: PromoOccasion[] = [
  // --- Ghana ---
  { id: "new-year", name: "New Year's Day", regions: ["ghana", "global"], month: 1, day: 1, note: "Fresh starts, resolutions, festive wear" },
  { id: "constitution-day", name: "Constitution Day", regions: ["ghana"], month: 1, day: 7, note: "National observance" },
  { id: "valentines", name: "Valentine's Day", regions: ["global"], month: 2, day: 14, note: "Evening wear, gifting, date-night looks" },
  { id: "womens-day", name: "International Women's Day", regions: ["global", "europe"], month: 3, day: 8, note: "Celebrate the women who wear DEW — strong tie-in for a womenswear brand" },
  { id: "ghana-month", name: "Ghana Month", regions: ["ghana"], month: 3, day: 1, note: "All of March — national pride, culture, heritage fashion" },
  { id: "independence-day", name: "Ghana Independence Day", regions: ["ghana"], month: 3, day: 6, note: "National pride, red-gold-green styling" },
  { id: "earth-day", name: "Earth Day", regions: ["global"], month: 4, day: 22, note: "Sustainable/handmade fashion angle — made-to-order, no overproduction" },
  { id: "may-day", name: "May Day / Labour Day", regions: ["ghana", "europe"], month: 5, day: 1, note: "Workers' celebration" },
  { id: "au-day", name: "African Union Day", regions: ["ghana"], month: 5, day: 25, note: "Pan-African pride" },
  { id: "juneteenth", name: "Juneteenth", regions: ["us"], month: 6, day: 19, note: "African-American heritage — resonant tie-in for an African fashion heritage brand" },
  { id: "canada-day", name: "Canada Day", regions: ["canada"], month: 7, day: 1, note: "National celebration, red-and-white styling" },
  { id: "republic-day", name: "Ghana Republic Day", regions: ["ghana"], month: 7, day: 1, note: "National celebration" },
  { id: "us-independence-day", name: "US Independence Day", regions: ["us"], month: 7, day: 4, note: "Long weekend, festive/summer wear" },
  { id: "emancipation-day", name: "Emancipation Day", regions: ["ghana"], month: 8, day: 1, note: "Heritage and freedom, African diaspora" },
  { id: "founders-day", name: "Founder's Day", regions: ["ghana"], month: 8, day: 4, note: "National founders celebration" },
  { id: "nkrumah-day", name: "Kwame Nkrumah Memorial Day", regions: ["ghana"], month: 9, day: 21, note: "National observance" },
  { id: "farmers-day", name: "Farmers' Day", regions: ["ghana"], month: 12, day: 5, note: "First Friday of December (approx.) — harvest, community" },
  { id: "christmas", name: "Christmas", regions: ["global"], month: 12, day: 25, note: "Festive wear, family gatherings, gifting" },
  { id: "boxing-day", name: "Boxing Day", regions: ["global"], month: 12, day: 26, note: "Post-Christmas shopping mood" },
  { id: "new-years-eve", name: "New Year's Eve", regions: ["global"], month: 12, day: 31, note: "Evening wear, party looks" },

  // --- Computed-date (rule-based, not lunar) ---
  {
    id: "black-friday",
    name: "Black Friday",
    regions: ["us", "canada", "europe", "global"],
    note: "The single biggest retail promo day of the year — day after US Thanksgiving",
    compute: (year) => {
      const thanksgiving = nthWeekdayOfMonth(year, 11, 4, 4); // 4th Thursday of November
      return new Date(thanksgiving.getFullYear(), thanksgiving.getMonth(), thanksgiving.getDate() + 1);
    },
  },
  {
    id: "white-friday",
    name: "White Friday",
    regions: ["middle-east"],
    note: "Middle East's Black Friday equivalent (souq.com/Amazon), same date — often runs as a 4-day weekend",
    compute: (year) => {
      const thanksgiving = nthWeekdayOfMonth(year, 11, 4, 4);
      return new Date(thanksgiving.getFullYear(), thanksgiving.getMonth(), thanksgiving.getDate() + 1);
    },
  },
  {
    id: "singles-day",
    name: "Singles' Day (11.11)",
    regions: ["china", "global"],
    month: 11,
    day: 11,
    note: "The single biggest online shopping day in the world by volume (Alibaba/Double 11) — even brands with no China presence see a halo effect",
  },
  {
    id: "el-buen-fin",
    name: "El Buen Fin",
    regions: ["mexico"],
    note: "Mexico's biggest retail weekend — the long weekend before Revolution Day (3rd Monday of November)",
    compute: (year) => {
      const revolutionDay = nthWeekdayOfMonth(year, 11, 1, 3); // 3rd Monday of November
      return new Date(revolutionDay.getFullYear(), revolutionDay.getMonth(), revolutionDay.getDate() - 3); // Friday before
    },
  },
  {
    id: "green-monday",
    name: "Green Monday",
    regions: ["us"],
    note: "2nd Monday of December — last-chance-for-Christmas-delivery shopping day",
    compute: (year) => nthWeekdayOfMonth(year, 12, 1, 2),
  },
  {
    id: "blue-monday",
    name: "Blue Monday",
    regions: ["europe", "global"],
    note: "3rd Monday of January — \"most depressing day of the year\", strong retail-therapy shopping spike",
    compute: (year) => nthWeekdayOfMonth(year, 1, 1, 3),
  },
  {
    id: "mothers-day-us",
    name: "Mother's Day (US/Canada)",
    regions: ["us", "canada"],
    note: "2nd Sunday of May — major gifting occasion",
    compute: (year) => nthWeekdayOfMonth(year, 5, 0, 2),
  },
  {
    id: "fathers-day-us",
    name: "Father's Day (US/Canada)",
    regions: ["us", "canada"],
    note: "3rd Sunday of June — gifting occasion, smaller than Mother's Day but still significant",
    compute: (year) => nthWeekdayOfMonth(year, 6, 0, 3),
  },
  {
    id: "cyber-monday",
    name: "Cyber Monday",
    regions: ["us", "canada", "europe", "global"],
    note: "Online-focused follow-up to Black Friday — the Monday after",
    compute: (year) => {
      const thanksgiving = nthWeekdayOfMonth(year, 11, 4, 4);
      return new Date(thanksgiving.getFullYear(), thanksgiving.getMonth(), thanksgiving.getDate() + 4);
    },
  },
  {
    id: "us-labor-day",
    name: "US/Canada Labor Day",
    regions: ["us", "canada"],
    note: "1st Monday of September — end-of-summer sales, transitional wardrobe",
    compute: (year) => nthWeekdayOfMonth(year, 9, 1, 1),
  },
  {
    id: "presidents-day",
    name: "Presidents' Day",
    regions: ["us"],
    note: "3rd Monday of February — classic US mid-winter sale day",
    compute: (year) => nthWeekdayOfMonth(year, 2, 1, 3),
  },
  {
    id: "uk-summer-bank-holiday",
    name: "UK Summer Bank Holiday",
    regions: ["europe"],
    note: "Last Monday of August — long weekend, UK/Ireland retail push",
    compute: (year) => lastWeekdayOfMonth(year, 8, 1),
  },
];

function nextOccurrence(occasion: PromoOccasion, from: Date): Date {
  const year = from.getFullYear();
  let d = occasion.compute ? occasion.compute(year) : new Date(year, occasion.month! - 1, occasion.day!);
  if (d.getTime() < from.getTime()) {
    d = occasion.compute ? occasion.compute(year + 1) : new Date(year + 1, occasion.month! - 1, occasion.day!);
  }
  return d;
}

export interface UpcomingOccasion extends PromoOccasion {
  date: string;
  daysAway: number;
  withinWindow: boolean;
}

/** Occasions landing within the lookahead window are the actionable ones
 * (promo-worthy, "coming up soon"). But the calendar always returns at
 * least a handful of occasions regardless — an empty list is
 * indistinguishable from a bug, so if nothing falls inside the window we
 * still show the next few occasions, just flagged as further out. */
export function getUpcomingOccasions(lookaheadDays = 30, minResults = 4, regions?: Region[]): UpcomingOccasion[] {
  const now = new Date();
  const pool = regions ? PROMO_OCCASIONS.filter((o) => o.regions.some((r) => regions.includes(r))) : PROMO_OCCASIONS;

  const all = pool
    .map((o) => {
      const date = nextOccurrence(o, now);
      const daysAway = Math.round((date.getTime() - now.getTime()) / 86400000);
      return { ...o, date: date.toISOString(), daysAway, withinWindow: daysAway <= lookaheadDays };
    })
    .sort((a, b) => a.daysAway - b.daysAway);

  const withinWindow = all.filter((o) => o.withinWindow);
  if (withinWindow.length >= minResults) return withinWindow;

  // Pad out with the next-nearest occasions so the list is never empty
  return all.slice(0, Math.max(minResults, withinWindow.length));
}
