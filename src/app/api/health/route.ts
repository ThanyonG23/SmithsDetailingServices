import { NextResponse } from "next/server";
import { pingDb } from "@/lib/ops/db";

/* Keep-warm health check. A free external pinger hits this every few minutes
   so the serverless function stays warm AND the Supabase database never
   pauses on idle (it runs a trivial SELECT 1). Public + no data exposed. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const ok = await pingDb();
  return NextResponse.json(
    { ok, service: "smiths-ops", ts: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
