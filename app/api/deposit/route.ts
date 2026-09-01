import { NextRequest, NextResponse } from "next/server";
import { paystackConfigured, initializeTransaction } from "@/lib/paystack-client";
import { addOrder } from "@/lib/store/orders";
import { convertUsdDepositToGhs } from "@/lib/currency";
import { getPublicSiteUrl } from "@/lib/site-url";

/**
 * Collects a 50% deposit for a custom order — NOT a full cart checkout
 * (that flow was removed; every DEW piece is made to order, there's no
 * inventory to check out with). This runs after either:
 *   - the Custom Made booking form is submitted, or
 *   - the "Order via WhatsApp" quick-order modal is submitted
 * Both converge here so there's one consistent payment step regardless
 * of which path the customer took.
 */
export async function POST(request: NextRequest) {
  if (!paystackConfigured()) {
    return NextResponse.json(
      { error: "Card/mobile money payments aren't connected yet. Please contact us directly to arrange your deposit." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const name = (body.name as string)?.trim();
  const email = (body.email as string)?.trim();
  const phone = (body.phone as string)?.trim();
  const designName = (body.designName as string)?.trim() || "Custom Design";
  const price = Number(body.price);

  if (!name || !email || !price || price <= 0) {
    return NextResponse.json({ error: "Missing name, email, or a valid design price" }, { status: 400 });
  }

  const depositAmount = Math.round(price * 0.5 * 100) / 100;
  const reference = `dewdep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const order = await addOrder({
    channel: "custom_deposit",
    items: [{ productId: "custom", name: designName, price, color: "", size: "", qty: 1 }],
    subtotal: price,
    shippingFee: 0,
    total: depositAmount,
    customerEmail: email,
    customerName: name,
    customerPhone: phone || null,
    shippingAddress: null,
    stripeSessionId: null,
    paystackReference: reference,
    status: "pending",
  });

  // We display and record everything in USD (DEW's international
  // customers expect USD pricing), but Ghana-registered Paystack accounts
  // reliably settle in GHS, and USD support needs special account
  // enablement that isn't guaranteed — so the actual charge converts to
  // GHS right here, at the last possible moment.
  const { ghsAmount, rate } = await convertUsdDepositToGhs(depositAmount);

  const result = await initializeTransaction({
    email,
    // Mobile money, card, and bank transfer are all shown natively on
    // Paystack's own hosted checkout page — no need to build a separate
    // payment-method picker here.
    amountMinorUnits: Math.round(ghsAmount * 100),
    currency: "GHS",
    reference,
    callbackUrl: `${getPublicSiteUrl()}/custom-design/deposit-received?reference=${reference}`,
    metadata: {
      orderId: order.id,
      designName,
      fullPriceUsd: price,
      depositAmountUsd: depositAmount,
      depositAmountGhs: ghsAmount,
      usdToGhsRate: rate,
      customerName: name,
      customerPhone: phone,
    },
  });

  if (!result.ok || !result.authorizationUrl) {
    return NextResponse.json({ error: result.error || "Couldn't start payment — please try again." }, { status: 502 });
  }

  return NextResponse.json({ url: result.authorizationUrl, ghsAmount, rate });
}
