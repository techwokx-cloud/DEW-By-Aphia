import { query, queryOne } from "@/lib/db";

export interface DMMessage {
  id: string;
  from: "lead" | "agent" | "admin";
  text: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  platform: "instagram" | "facebook";
  handle: string;
  status: "new" | "engaged" | "qualified" | "won" | "lost";
  messages: DMMessage[];
  draftReply: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LeadRow {
  id: string;
  platform: Lead["platform"];
  handle: string;
  status: Lead["status"];
  messages: DMMessage[];
  draft_reply: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(r: LeadRow): Lead {
  return {
    id: r.id,
    platform: r.platform,
    handle: r.handle,
    status: r.status,
    messages: r.messages,
    draftReply: r.draft_reply,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function listLeads(): Promise<Lead[]> {
  const rows = await query<LeadRow>(`SELECT * FROM leads ORDER BY updated_at DESC`);
  return rows.map(fromRow);
}

export async function getLead(id: string): Promise<Lead | undefined> {
  const row = await queryOne<LeadRow>(`SELECT * FROM leads WHERE id = $1`, [id]);
  return row ? fromRow(row) : undefined;
}

export async function findOrCreateLead(platform: Lead["platform"], handle: string): Promise<Lead> {
  const existing = await queryOne<LeadRow>(
    `SELECT * FROM leads WHERE platform = $1 AND handle = $2`,
    [platform, handle]
  );
  if (existing) return fromRow(existing);

  const id = `lead_${Date.now()}`;
  const row = await queryOne<LeadRow>(
    `INSERT INTO leads (id, platform, handle, status, messages, draft_reply)
     VALUES ($1, $2, $3, 'new', '[]', NULL)
     ON CONFLICT (platform, handle) DO UPDATE SET handle = EXCLUDED.handle
     RETURNING *`,
    [id, platform, handle]
  );
  return fromRow(row!);
}

export async function appendMessage(leadId: string, from: DMMessage["from"], text: string): Promise<DMMessage | null> {
  const message: DMMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    from,
    text,
    createdAt: new Date().toISOString(),
  };
  const row = await queryOne<LeadRow>(
    `UPDATE leads
     SET messages = messages || $2::jsonb, updated_at = $3
     WHERE id = $1
     RETURNING *`,
    [leadId, JSON.stringify([message]), message.createdAt]
  );
  return row ? message : null;
}

export async function setDraftReply(leadId: string, draft: string | null): Promise<Lead | null> {
  const row = await queryOne<LeadRow>(
    `UPDATE leads SET draft_reply = $2 WHERE id = $1 RETURNING *`,
    [leadId, draft]
  );
  return row ? fromRow(row) : null;
}

export async function setLeadStatus(leadId: string, status: Lead["status"]): Promise<Lead | null> {
  const row = await queryOne<LeadRow>(
    `UPDATE leads SET status = $2 WHERE id = $1 RETURNING *`,
    [leadId, status]
  );
  return row ? fromRow(row) : null;
}
