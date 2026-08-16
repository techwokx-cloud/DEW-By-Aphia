/**
 * Sends approval-needed notifications to the site owner over WhatsApp using
 * Meta's WhatsApp Business Platform (Cloud API). Real, production-shaped
 * code — but inert (returns { sent: false, reason: "not_configured" })
 * until these env vars exist in Render:
 *
 *   WHATSAPP_BUSINESS_TOKEN    permanent access token for your WhatsApp Business app
 *   WHATSAPP_PHONE_NUMBER_ID   the Meta-assigned ID for your business's WhatsApp number
 *   WHATSAPP_OWNER_NUMBER      the owner's number to notify, e.g. 233504115111 (no +)
 *
 * Getting those requires a Meta Developer App with the WhatsApp product
 * added, a verified business phone number, and (for anything beyond a
 * 24-hour test window) an approved message template — none of which can be
 * set up from here. Until configured, approval requests just live in the
 * admin dashboard, which still works fine on its own.
 */

import { getOwnerWhatsappNumber, getWhatsappBusinessToken, getWhatsappPhoneNumberId } from "@/lib/store/settings";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

function isConfigured() {
  return Boolean(getWhatsappBusinessToken() && getWhatsappPhoneNumberId() && getOwnerWhatsappNumber());
}

export async function notifyOwner(message: string) {
  if (!isConfigured()) {
    return { sent: false, reason: "not_configured" as const };
  }

  const phoneNumberId = getWhatsappPhoneNumberId();
  const token = getWhatsappBusinessToken();
  const to = getOwnerWhatsappNumber();

  const res = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  }).then((r) => r.json());

  return { sent: Boolean(res.messages?.[0]?.id), reason: res.messages?.[0]?.id ? undefined : ("send_failed" as const) };
}

export const whatsappBusinessConfigured = isConfigured;
