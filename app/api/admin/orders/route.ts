import { NextResponse } from "next/server";
import { listOrders } from "@/lib/store/orders";

export async function GET() {
  return NextResponse.json({ items: await listOrders() });
}
