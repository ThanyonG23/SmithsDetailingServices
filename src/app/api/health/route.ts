import { NextResponse } from "next/server";
import {
  pingDb,
  checklistSelfTest,
  dashDiagnostics,
  teamDiagnostics,
  getStaffHoursRange,
} from "@/lib/ops/db";

/* Keep-warm health check. A free external pinger hits this every few minutes
   so the serverless function stays warm AND the Supabase database never
   pauses on idle (it runs a trivial SELECT 1, capped at 6s). Public, no data.
   ?deep=checklist runs a checklist read/write self-test. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const deep = params.get("deep");
  const ok = await pingDb();
  const checklist = deep === "checklist" ? await checklistSelfTest() : undefined;
  const dash = deep === "dash" ? await dashDiagnostics() : undefined;
  const team = deep === "team" ? await teamDiagnostics() : undefined;
  // Crew-hours read is token-gated (staff data), reusing AI_REPLY_EXT_TOKEN.
  const token = req.headers.get("x-ext-token") || params.get("token") || "";
  const hours =
    deep === "hours" && process.env.AI_REPLY_EXT_TOKEN && token === process.env.AI_REPLY_EXT_TOKEN
      ? await getStaffHoursRange(params.get("from") || "1970-01-01", params.get("to") || "2999-01-01")
      : undefined;
  return NextResponse.json(
    { ok, checklist, dash, team, hours, service: "smiths-ops", ts: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
