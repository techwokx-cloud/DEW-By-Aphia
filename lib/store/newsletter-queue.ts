export interface NewsletterDraft {
  id: string;
  subject: string;
  body: string;
  status: "draft" | "approved" | "rejected" | "sent";
  createdAt: string;
}

const QUEUE: NewsletterDraft[] = [];

export function listNewsletterDrafts(): NewsletterDraft[] {
  return [...QUEUE].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addNewsletterDraft(input: { subject: string; body: string }): NewsletterDraft {
  const draft: NewsletterDraft = {
    ...input,
    id: `news_${Date.now()}`,
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  QUEUE.push(draft);
  return draft;
}

export function updateNewsletterDraft(id: string, patch: Partial<NewsletterDraft>): NewsletterDraft | null {
  const draft = QUEUE.find((d) => d.id === id);
  if (!draft) return null;
  Object.assign(draft, patch);
  return draft;
}
