import { NextRequest, NextResponse } from "next/server";
import { paystackConfigured, initializeTransaction } from "@/lib/paystack-client";
import { getShippingFee, getZoneLabel } from "@/lib/shipping-calculator";
import { addOrder } from "@/lib/store/orders";
import { getPublicSiteUrl } from "@/lib/site-url";
import type { CartItem } from "@/lib/cart-context";

export async function POST(request: NextRequest) {
  if (!paystackConfigured()) {
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
  const total = subtotal + shippingFee;

  // Paystack references must be unique per transaction and are the only
  // thing we can look the order back up by once the customer returns from
  // the hosted checkout page, or when the webhook fires.
  const reference = `dew_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const order = await addOrder({
    channel: "international_card",
    items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, color: i.color, size: i.size, qty: i.qty })),
    subtotal,
    shippingFee,
    total,
    customerEmail: email,
    shippingAddress: address,
    stripeSessionId: null,
    paystackReference: reference,
    status: "pending",
  });

  const result = await initializeTransaction({
    email,
    // Paystack takes the amount in the currency's smallest unit — cents
    // for USD — same convention as Stripe's unit_amount.
    amountMinorUnits: Math.round(total * 100),
    currency: "USD",
    reference,
    callbackUrl: `${getPublicSiteUrl()}/checkout/success?reference=${reference}`,
    metadata: {
      orderId: order.id,
      zone: getZoneLabel(address.country),
      cancel_action: `${getPublicSiteUrl()}/checkout/cancelled`,
    },
  });

  if (!result.ok || !result.authorizationUrl) {
    return NextResponse.json({ error: "Couldn't start checkout — please try again." }, { status: 502 });
  }

  return NextResponse.json({ url: result.authorizationUrl });
}
