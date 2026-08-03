import { NextResponse } from "next/server";
import { pingDb, checklistSelfTest, dashDiagnostics } from "@/lib/ops/db";

/* Keep-warm health check. A free external pinger hits this every few minutes
   so the serverless function stays warm AND the Supabase database never
   pauses on idle (it runs a trivial SELECT 1, capped at 6s). Public, no data.
   ?deep=checklist runs a checklist read/write self-test. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const deep = new URL(req.url).searchParams.get("deep");
  const ok = await pingDb();
  const checklist = deep === "checklist" ? await checklistSelfTest() : undefined;
  const dash = deep === "dash" ? await dashDiagnostics() : undefined;
  return NextResponse.json(
    { ok, checklist, dash, service: "smiths-ops", ts: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
