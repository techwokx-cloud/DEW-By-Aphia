export interface Subscriber {
  id: string;
  email: string;
  whatsapp: string | null;
  createdAt: string;
}

// Phase 1: in-memory. Swap for a Supabase table in Phase 2 — same shape.
const SUBSCRIBERS: Subscriber[] = [];

export function listSubscribers(): Subscriber[] {
  return [...SUBSCRIBERS].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addSubscriber(email: string, whatsapp?: string | null): Subscriber {
  const existing = SUBSCRIBERS.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    if (whatsapp) existing.whatsapp = whatsapp;
    return existing;
  }
  const subscriber: Subscriber = {
    id: `sub_${Date.now()}`,
    email,
    whatsapp: whatsapp || null,
    createdAt: new Date().toISOString(),
  };
  SUBSCRIBERS.push(subscriber);
  return subscriber;
}
