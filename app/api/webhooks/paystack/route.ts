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
      await notifyOwner(
        `New international order paid! ${order.items.length} item(s), total $${order.total} (incl. $${order.shippingFee} shipping) shipping to ${order.shippingAddress?.city}, ${order.shippingAddress?.country}. Check Orders in the admin dashboard.`
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
