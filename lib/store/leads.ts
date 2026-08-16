export interface DMMessage {
  id: string;
  from: "lead" | "agent" | "admin";
  text: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  igHandle: string;
  status: "new" | "engaged" | "qualified" | "won" | "lost";
  messages: DMMessage[];
  draftReply: string | null;
  createdAt: string;
  updatedAt: string;
}

// Phase 1: in-memory. Real Instagram DMs will arrive via the Meta webhook
// at app/api/instagram/webhook once that's connected — this store and the
// dashboard UI are already shaped to receive them. Until then, the admin
// dashboard's "Simulate incoming DM" lets you test the sales agent's replies.
const LEADS: Lead[] = [];

export function listLeads(): Lead[] {
  return [...LEADS].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getLead(id: string): Lead | undefined {
  return LEADS.find((l) => l.id === id);
}

export function findOrCreateLead(igHandle: string): Lead {
  let lead = LEADS.find((l) => l.igHandle === igHandle);
  if (!lead) {
    const now = new Date().toISOString();
    lead = { id: `lead_${Date.now()}`, igHandle, status: "new", messages: [], draftReply: null, createdAt: now, updatedAt: now };
    LEADS.push(lead);
  }
  return lead;
}

export function appendMessage(leadId: string, from: DMMessage["from"], text: string): DMMessage | null {
  const lead = getLead(leadId);
  if (!lead) return null;
  const message: DMMessage = { id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, from, text, createdAt: new Date().toISOString() };
  lead.messages.push(message);
  lead.updatedAt = message.createdAt;
  return message;
}

export function setDraftReply(leadId: string, draft: string | null): Lead | null {
  const lead = getLead(leadId);
  if (!lead) return null;
  lead.draftReply = draft;
  return lead;
}

export function setLeadStatus(leadId: string, status: Lead["status"]): Lead | null {
  const lead = getLead(leadId);
  if (!lead) return null;
  lead.status = status;
  return lead;
}
