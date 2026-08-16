import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/store/settings";

export function stripeConfigured(): boolean {
  return Boolean(getStripeSecretKey());
}

export function getStripeClient(): Stripe | null {
  const key = getStripeSecretKey();
  if (!key) return null;
  return new Stripe(key);
}
