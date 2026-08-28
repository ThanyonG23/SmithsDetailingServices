// Inbound SMS webhook for Telstra Messaging API v3 — the STOP-handler
// required under the Australian Spam Act 2003. Telstra POSTs every inbound
// reply here; STOP-style keywords add the sender to the opt-out ledger, after
// which telstra-sms.ts::sendSMS refuses to message them.

import { NextRequest, NextResponse } from "next/server";
import { addUnsubscribe, normalisePhone } from "@/lib/ops/sms-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STOP_WORDS = ["STOP", "STOPALL", "UNSUBSCRIBE", "OPT OUT", "OPTOUT", "END", "CANCEL", "QUIT"];

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({} as Record<string, unknown>));
    const fromRaw = (payload?.from || payload?.sender || payload?.origin || "") as string;
    const bodyRaw = (payload?.messageContent || payload?.message || payload?.text || "") as string;

    if (!fromRaw || !bodyRaw) return NextResponse.json({ received: true });

    const phone = normalisePhone(String(fromRaw));
    const text = String(bodyRaw).trim().toUpperCase();
    const firstWord = text.split(/\s+/)[0];
    const isOptOut = STOP_WORDS.includes(firstWord) || STOP_WORDS.includes(text);

    if (!isOptOut) return NextResponse.json({ received: true, action: "none" });

    await addUnsubscribe(phone, "user_stop");
    return NextResponse.json({ received: true, action: "opted_out" });
  } catch (e) {
    console.error("[telstra-inbound]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "telstra-inbound" });
}
