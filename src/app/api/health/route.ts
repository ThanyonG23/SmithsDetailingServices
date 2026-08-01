import { NextResponse } from "next/server";
import { pingDb, dbDiagnostics } from "@/lib/ops/db";

/* Keep-warm health check. A free external pinger hits this every few minutes
   so the serverless function stays warm AND the Supabase database never
   pauses on idle (it runs a trivial SELECT 1). Public + no data exposed.
   ?deep=1 runs a per-table diagnostic (counts only, no data). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const deep = new URL(req.url).searchParams.get("deep");
  const ok = await pingDb();
  const checks = deep ? await dbDiagnostics() : undefined;
  return NextResponse.json(
    { ok, checks, service: "smiths-ops", ts: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
