/**
 * Shipping fees are a real financial number, so this is a plain rule-based
 * lookup rather than an AI guess — an LLM has no actual knowledge of DHL/
 * FedEx rates for your specific parcels, and hallucinating a shipping fee
 * risks either losing money on every order or overcharging customers.
 * These are starting defaults — adjust them in lib/shipping-calculator.ts
 * (or wire to a real carrier rate API like Shippo/EasyPost later) once you
 * know your actual per-zone costs.
 */

export type ShippingZone = "ghana" | "usa_ca" | "uk_eu" | "australia_nz" | "rest_of_world";

const ZONE_BY_COUNTRY: Record<string, ShippingZone> = {
  GH: "ghana",
  US: "usa_ca",
  CA: "usa_ca",
  GB: "uk_eu",
  IE: "uk_eu",
  FR: "uk_eu",
  DE: "uk_eu",
  NL: "uk_eu",
  AU: "australia_nz",
  NZ: "australia_nz",
};

const ZONE_FLAT_RATE: Record<ShippingZone, number> = {
  ghana: 0, // Ghana orders go through WhatsApp, not this checkout
  usa_ca: 35,
  uk_eu: 30,
  australia_nz: 45,
  rest_of_world: 50,
};

const ZONE_LABEL: Record<ShippingZone, string> = {
  ghana: "Ghana",
  usa_ca: "USA / Canada",
  uk_eu: "UK / Europe",
  australia_nz: "Australia / New Zealand",
  rest_of_world: "Rest of World",
};

export function getZoneForCountry(countryCode: string): ShippingZone {
  return ZONE_BY_COUNTRY[countryCode.toUpperCase()] ?? "rest_of_world";
}

export function getShippingFee(countryCode: string): number {
  return ZONE_FLAT_RATE[getZoneForCountry(countryCode)];
}

export function getZoneLabel(countryCode: string): string {
  return ZONE_LABEL[getZoneForCountry(countryCode)];
}

export const SHIPPABLE_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
];
