import { NextRequest, NextResponse } from "next/server";
import { convertUsdDepositToGhs } from "@/lib/currency";

// Public, read-only — just shows the current USD->GHS estimate for a
// deposit amount before the customer commits to anything. No order or
// Paystack transaction is created here.
export async function GET(request: NextRequest) {
  const usd = Number(request.nextUrl.searchParams.get("usd"));
  if (!usd || usd <= 0) {
    return NextResponse.json({ error: "usd query param required" }, { status: 400 });
  }
  const conversion = await convertUsdDepositToGhs(usd);
  return NextResponse.json(conversion);
}
