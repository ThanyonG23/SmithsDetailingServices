"use server";

import { requireOwner } from "@/lib/ops/auth";
import { sendSMS, listVirtualNumbers, setReplyCallback, inboundUrl } from "@/lib/ops/telstra-sms";
import {
  getRecipients,
  listUnsubscribes,
  smsStats,
  recordSend,
  addUnsubscribe,
  removeUnsubscribe,
  normalisePhone,
  isValidAuMobile,
  type Recipient,
  type UnsubRow,
} from "@/lib/ops/sms-db";

export async function loadSmsData(): Promise<{
  recipients: Recipient[];
  stats: { contactable: number; unsubscribed: number; sentToday: number };
  unsubs: UnsubRow[];
}> {
  requireOwner();
  // Sequential — the pooled connection deadlocks on parallel queries.
  const recipients = await getRecipients();
  const stats = await smsStats();
  const unsubs = await listUnsubscribes(200);
  return { recipients, stats, unsubs };
}

export async function sendTestSms(phone: string, body: string): Promise<{ ok: boolean; error?: string }> {
  requireOwner();
  const p = normalisePhone(phone);
  if (!isValidAuMobile(p)) return { ok: false, error: "That doesn't look like an AU mobile (+61 4…)." };
  if (!body.trim()) return { ok: false, error: "Write a message first." };
  const r = await sendSMS(p, body);
  if (r.success) {
    await recordSend(p, body, "test", "sent");
    return { ok: true };
  }
  if (r.blocked) return { ok: false, error: "That number has opted out." };
  return { ok: false, error: r.error || "Send failed." };
}

/* Sends one small batch of a campaign. The client pages through the recipient
   list in batches so the whole blast never times out a single request and stays
   gently throttled. */
export async function sendSmsBatch(
  body: string,
  campaign: string,
  phones: string[],
): Promise<{ sent: number; failed: number; blocked: number }> {
  requireOwner();
  let sent = 0,
    failed = 0,
    blocked = 0;
  for (const raw of phones) {
    const phone = normalisePhone(raw);
    const r = await sendSMS(phone, body);
    if (r.success) {
      sent++;
      await recordSend(phone, body, campaign, "sent");
    } else if (r.blocked === "opted_out") {
      blocked++;
      await recordSend(phone, body, campaign, "blocked");
    } else {
      failed++;
      await recordSend(phone, body, campaign, "failed", r.error || "");
    }
  }
  return { sent, failed, blocked };
}

export async function optOutManual(phone: string): Promise<{ ok: boolean }> {
  requireOwner();
  const p = normalisePhone(phone);
  if (!isValidAuMobile(p)) return { ok: false };
  await addUnsubscribe(p, "manual");
  return { ok: true };
}

export async function optInManual(phone: string): Promise<{ ok: boolean }> {
  requireOwner();
  await removeUnsubscribe(normalisePhone(phone));
  return { ok: true };
}

// Is STOP wired up? Shows each virtual number and whether its reply-callback
// points at this site's inbound endpoint (which records opt-outs).
export async function smsConfig(): Promise<{
  ok: boolean;
  inbound: string;
  numbers: { number: string; replyCallbackUrl: string; connected: boolean }[];
  error?: string;
}> {
  requireOwner();
  const inbound = inboundUrl();
  try {
    const vns = await listVirtualNumbers();
    return {
      ok: true,
      inbound,
      numbers: vns.map((v) => ({ ...v, connected: v.replyCallbackUrl === inbound })),
    };
  } catch (e) {
    return { ok: false, inbound, numbers: [], error: e instanceof Error ? e.message : "error" };
  }
}

// Point every virtual number's STOP replies at this site.
export async function fixReplyCallback(): Promise<{ ok: boolean; fixed: number; error?: string }> {
  requireOwner();
  const inbound = inboundUrl();
  try {
    const vns = await listVirtualNumbers();
    let fixed = 0;
    for (const v of vns) {
      const r = await setReplyCallback(v.number, inbound);
      if (r.ok) fixed++;
    }
    return { ok: fixed > 0, fixed };
  } catch (e) {
    return { ok: false, fixed: 0, error: e instanceof Error ? e.message : "error" };
  }
}
