import { NextResponse } from "next/server";
import { listSeedAdCampaigns } from "@/lib/store/seed-ads";

export async function GET() {
  return NextResponse.json({ items: await listSeedAdCampaigns() });
}
