import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, stripeConfigured } from "@/lib/stripe-client";
import { getShippingFee, getZoneLabel } from "@/lib/shipping-calculator";
import { addOrder } from "@/lib/store/orders";
import type { CartItem } from "@/lib/cart-context";

export async function POST(request: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Card payments aren't connected yet. Please use WhatsApp checkout, or contact us directly." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const items = body.items as CartItem[];
  const email = body.email as string;
  const address = body.address as {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };

  if (!items?.length || !email || !address?.country) {
    return NextResponse.json({ error: "Missing items, email, or shipping address" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingFee = getShippingFee(address.country);
  const stripe = getStripeClient()!;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      ...items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: `${item.name} (${item.color}, ${item.size})` },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Shipping — ${getZoneLabel(address.country)}` },
          unit_amount: Math.round(shippingFee * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${request.nextUrl.origin}/checkout/cancelled`,
  });

  addOrder({
    channel: "international_card",
    items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, color: i.color, size: i.size, qty: i.qty })),
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    customerEmail: email,
    shippingAddress: address,
    stripeSessionId: session.id,
    status: "pending",
  });

  return NextResponse.json({ url: session.url });
}
