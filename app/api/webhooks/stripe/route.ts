import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe-client";
import { updateOrderByStripeSession } from "@/lib/store/orders";
import { notifyOwner } from "@/lib/whatsapp-owner-notify";

/**
 * Register this URL in the Stripe Dashboard → Developers → Webhooks:
 *   https://your-domain/api/webhooks/stripe
 * listening for the checkout.session.completed event. Set the signing
 * secret it gives you as STRIPE_WEBHOOK_SECRET so we can verify the
 * request actually came from Stripe (never trust an unverified webhook
 * for something that confirms real payment).
 */
export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; amount_total: number | null };
    const order = updateOrderByStripeSession(session.id, { status: "paid" });

    if (order) {
      await notifyOwner(
        `New international order paid! ${order.items.length} item(s), total $${order.total} (incl. $${order.shippingFee} shipping) shipping to ${order.shippingAddress?.city}, ${order.shippingAddress?.country}. Check Orders in the admin dashboard.`
      );
    }
  }

  return NextResponse.json({ received: true });
}
