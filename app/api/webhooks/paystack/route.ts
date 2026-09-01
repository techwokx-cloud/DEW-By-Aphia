import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack-client";
import { updateOrderByPaystackReference } from "@/lib/store/orders";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";

/**
 * Register this URL in the Paystack Dashboard → Settings → API Keys &
 * Webhooks → Webhook URL:
 *   https://your-domain/api/webhooks/paystack
 * Paystack signs every webhook with your secret key (HMAC-SHA512 of the
 * raw body) in the x-paystack-signature header — verified below before
 * trusting anything the payload claims. Never trust an unverified webhook
 * for something that confirms real payment.
 *
 * Every order through this webhook is a 50% deposit on a custom piece
 * (see /api/deposit) — there's no full-cart checkout anymore.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();

  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    console.error("Paystack webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as { event: string; data: { reference: string; amount: number; status: string } };

  if (event.event === "charge.success" && event.data.status === "success") {
    const order = await updateOrderByPaystackReference(event.data.reference, { status: "paid" });

    if (order) {
      const designName = order.items[0]?.name ?? "a custom piece";
      await notifyOwner(
        `Deposit received! $${order.total} (50% of $${order.subtotal}) from ${order.customerName ?? "a customer"} ` +
        `for "${designName}". Contact them at ${order.customerEmail}${order.customerPhone ? ` / ${order.customerPhone}` : ""} ` +
        `to confirm measurements and start production. Check Orders in the admin dashboard.`
      );
    }
  }

  if (event.event === "charge.failed") {
    await updateOrderByPaystackReference(event.data.reference, { status: "failed" });
  }

  // Paystack expects a 200 quickly, or it'll retry the webhook — always
  // acknowledge receipt even for event types we don't act on.
  return NextResponse.json({ received: true });
}
