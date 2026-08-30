import { query, queryOne } from "@/lib/db";

export interface NewsletterDraft {
  id: string;
  subject: string;
  body: string;
  status: "draft" | "approved" | "rejected" | "sent";
  createdAt: string;
}

interface NewsletterRow {
  id: string;
  subject: string;
  body: string;
  status: NewsletterDraft["status"];
  created_at: string;
}

function fromRow(r: NewsletterRow): NewsletterDraft {
  return { id: r.id, subject: r.subject, body: r.body, status: r.status, createdAt: new Date(r.created_at).toISOString() };
}

export async function listNewsletterDrafts(): Promise<NewsletterDraft[]> {
  const rows = await query<NewsletterRow>(`SELECT * FROM newsletter_drafts ORDER BY created_at DESC`);
  return rows.map(fromRow);
}

export async function addNewsletterDraft(input: { subject: string; body: string }): Promise<NewsletterDraft> {
  const id = `news_${Date.now()}`;
  const row = await queryOne<NewsletterRow>(
    `INSERT INTO newsletter_drafts (id, subject, body, status) VALUES ($1, $2, $3, 'draft') RETURNING *`,
    [id, input.subject, input.body]
  );
  return fromRow(row!);
}

export async function updateNewsletterDraft(id: string, patch: Partial<NewsletterDraft>): Promise<NewsletterDraft | null> {
  if (patch.status === undefined) return null;
  const row = await queryOne<NewsletterRow>(
    `UPDATE newsletter_drafts SET status = $2 WHERE id = $1 RETURNING *`,
    [id, patch.status]
  );
  return row ? fromRow(row) : null;
}
