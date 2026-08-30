import { query, queryOne } from "@/lib/db";

export interface Subscriber {
  id: string;
  email: string;
  whatsapp: string | null;
  createdAt: string;
}

interface SubscriberRow {
  id: string;
  email: string;
  whatsapp: string | null;
  created_at: string;
}

function fromRow(r: SubscriberRow): Subscriber {
  return { id: r.id, email: r.email, whatsapp: r.whatsapp, createdAt: new Date(r.created_at).toISOString() };
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const rows = await query<SubscriberRow>(`SELECT * FROM subscribers ORDER BY created_at DESC`);
  return rows.map(fromRow);
}

export async function addSubscriber(email: string, whatsapp?: string | null): Promise<Subscriber> {
  const id = `sub_${Date.now()}`;
  const normalizedEmail = email.toLowerCase();
  const row = await queryOne<SubscriberRow>(
    `INSERT INTO subscribers (id, email, whatsapp)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET whatsapp = COALESCE(EXCLUDED.whatsapp, subscribers.whatsapp)
     RETURNING *`,
    [id, normalizedEmail, whatsapp ?? null]
  );
  return fromRow(row!);
}
