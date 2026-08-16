export interface GhanaOccasion {
  id: string;
  name: string;
  /** Month (1-12) and day */
  month: number;
  day: number;
  note: string;
}

// Fixed-date Ghanaian occasions relevant to a fashion brand's promo calendar.
// Lunar/variable-date holidays (Easter, Eid al-Fitr, Eid al-Adha) are
// intentionally left out since they shift yearly and need real astronomical
// calculation to place correctly — worth adding properly later rather than
// guessing a date.
export const GHANA_OCCASIONS: GhanaOccasion[] = [
  { id: "new-year", name: "New Year's Day", month: 1, day: 1, note: "Fresh starts, resolutions, festive wear" },
  { id: "constitution-day", name: "Constitution Day", month: 1, day: 7, note: "National observance" },
  { id: "valentines", name: "Valentine's Day", month: 2, day: 14, note: "Evening wear, gifting, date-night looks" },
  { id: "ghana-month", name: "Ghana Month", month: 3, day: 1, note: "All of March — national pride, culture, heritage fashion" },
  { id: "independence-day", name: "Independence Day", month: 3, day: 6, note: "National pride, red-gold-green styling" },
  { id: "may-day", name: "May Day / Labour Day", month: 5, day: 1, note: "Workers' celebration" },
  { id: "au-day", name: "African Union Day", month: 5, day: 25, note: "Pan-African pride" },
  { id: "republic-day", name: "Republic Day", month: 7, day: 1, note: "National celebration" },
  { id: "emancipation-day", name: "Emancipation Day", month: 8, day: 1, note: "Heritage and freedom, African diaspora" },
  { id: "founders-day", name: "Founder's Day", month: 8, day: 4, note: "National founders celebration" },
  { id: "nkrumah-day", name: "Kwame Nkrumah Memorial Day", month: 9, day: 21, note: "National observance" },
  { id: "farmers-day", name: "Farmers' Day", month: 12, day: 5, note: "First Friday of December (approx.) — harvest, community" },
  { id: "christmas", name: "Christmas", month: 12, day: 25, note: "Festive wear, family gatherings, gifting" },
  { id: "boxing-day", name: "Boxing Day", month: 12, day: 26, note: "Post-Christmas shopping mood" },
];

function nextOccurrence(month: number, day: number, from: Date): Date {
  const year = from.getFullYear();
  let d = new Date(year, month - 1, day);
  if (d.getTime() < from.getTime()) d = new Date(year + 1, month - 1, day);
  return d;
}

export interface UpcomingOccasion extends GhanaOccasion {
  date: string;
  daysAway: number;
  withinWindow: boolean;
}

/** Occasions landing within the lookahead window are the actionable ones
 * (promo-worthy, "coming up soon"). But the calendar always returns at
 * least a handful of occasions regardless — an empty list is
 * indistinguishable from a bug, so if nothing falls inside the window we
 * still show the next few occasions, just flagged as further out. */
export function getUpcomingOccasions(lookaheadDays = 30, minResults = 4): UpcomingOccasion[] {
  const now = new Date();
  const all = GHANA_OCCASIONS.map((o) => {
    const date = nextOccurrence(o.month, o.day, now);
    const daysAway = Math.round((date.getTime() - now.getTime()) / 86400000);
    return { ...o, date: date.toISOString(), daysAway, withinWindow: daysAway <= lookaheadDays };
  }).sort((a, b) => a.daysAway - b.daysAway);

  const withinWindow = all.filter((o) => o.withinWindow);
  if (withinWindow.length >= minResults) return withinWindow;

  // Pad out with the next-nearest occasions so the list is never empty
  return all.slice(0, Math.max(minResults, withinWindow.length));
}
