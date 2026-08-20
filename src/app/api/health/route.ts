import { NextResponse } from "next/server";
import {
  pingDb,
  checklistSelfTest,
  dashDiagnostics,
  teamDiagnostics,
  getStaffHoursRange,
  getBookingsDump,
  leadDiagnostics,
  inspectDiagnostics,
  getAds,
  getSalesStats,
  getLeadAnalytics,
  getLeadSaleMatch,
  customerDiagnostics,
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
  // Business-data reads are token-gated, reusing AI_REPLY_EXT_TOKEN.
  const token = req.headers.get("x-ext-token") || params.get("token") || "";
  const tokenOk = !!process.env.AI_REPLY_EXT_TOKEN && token === process.env.AI_REPLY_EXT_TOKEN;
  const from = params.get("from") || "1970-01-01";
  const to = params.get("to") || "2999-01-01";
  const hours = deep === "hours" && tokenOk ? await getStaffHoursRange(from, to) : undefined;
  const bookings = deep === "bookings" && tokenOk ? await getBookingsDump(from, to) : undefined;
  const leads = deep === "leads" && tokenOk ? await leadDiagnostics() : undefined;
  const inspect = deep === "inspect" && tokenOk ? await inspectDiagnostics() : undefined;
  const ads = deep === "ads" && tokenOk ? await getAds() : undefined;
  const sales = deep === "sales" && tokenOk ? await getSalesStats(from, to) : undefined;
  const leadan = deep === "leadan" && tokenOk ? await getLeadAnalytics(from, to, to) : undefined;
  const leadmatch = deep === "leadmatch" && tokenOk ? await getLeadSaleMatch() : undefined;
  const customers = deep === "customers" && tokenOk ? await customerDiagnostics() : undefined;
  return NextResponse.json(
    { ok, checklist, dash, team, hours, bookings, leads, inspect, ads, sales, leadan, leadmatch, customers, service: "smiths-ops", ts: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
