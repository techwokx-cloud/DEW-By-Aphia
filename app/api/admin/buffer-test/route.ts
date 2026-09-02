import { NextResponse } from "next/server";
import { testBufferConnection } from "@/lib/buffer-client";

// Exploratory only — confirms the API key works and lists connected
// channels/IDs. Doesn't touch any real publishing path.
export async function GET() {
  const result = await testBufferConnection();
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Connection test failed" }, { status: 400 });
  }
  return NextResponse.json(result);
}
