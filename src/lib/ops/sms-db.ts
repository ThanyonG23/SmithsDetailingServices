import { sql } from "./db";

/* SMS blast data layer.

   Two tables:
   - sms_unsubscribes: the opt-out ledger (Australian Spam Act 2003). Once a
     phone is here, sendSMS refuses to send to it. Written by the inbound
     STOP webhook and by manual opt-outs.
   - sms_sends: an audit log of every outbound attempt (who / what / status),
     so we have a record and can avoid double-sends. */

let ensured = false;
export async function ensureSmsTables(): Promise<void> {
  if (ensured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS sms_unsubscribes (
      phone           text PRIMARY KEY,
      source          text NOT NULL DEFAULT 'user_stop',
      unsubscribed_at timestamptz NOT NULL DEFAULT now()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sms_sends (
      id         bigserial PRIMARY KEY,
      phone      text NOT NULL,
      body       text NOT NULL DEFAULT '',
      campaign   text NOT NULL DEFAULT '',
      status     text NOT NULL DEFAULT 'sent',
      error      text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;
  ensured = true;
}

// AU mobile in E.164, matches lib/telstra-sms normalisePhone output.
export function normalisePhone(to: string): string {
  const phone = String(to || "").replace(/[^\d+]/g, "");
  if (phone.startsWith("+")) return phone;
  if (phone.startsWith("61") && phone.length >= 11) return "+" + phone;
  if (phone.startsWith("04") && phone.length === 10) return "+61" + phone.substring(1);
  if (phone.startsWith("4") && phone.length >= 9) return "+61" + phone;
  return "+61" + phone;
}

// Only real AU mobiles (+614XXXXXXXX). Landlines / junk can't take an SMS.
export function isValidAuMobile(e164: string): boolean {
  return /^\+614\d{8}$/.test(e164);
}

export async function isUnsubscribed(phone: string): Promise<boolean> {
  await ensureSmsTables();
  const rows = await sql<{ phone: string }[]>`
    SELECT phone FROM sms_unsubscribes WHERE phone = ${phone} LIMIT 1
  `;
  return rows.length > 0;
}

export async function addUnsubscribe(phone: string, source = "manual"): Promise<void> {
  await ensureSmsTables();
  await sql`
    INSERT INTO sms_unsubscribes (phone, source) VALUES (${phone}, ${source})
    ON CONFLICT (phone) DO NOTHING
  `;
}

export async function removeUnsubscribe(phone: string): Promise<void> {
  await ensureSmsTables();
  await sql`DELETE FROM sms_unsubscribes WHERE phone = ${phone}`;
}

export async function recordSend(
  phone: string,
  body: string,
  campaign: string,
  status: string,
  error = "",
): Promise<void> {
  await ensureSmsTables();
  await sql`
    INSERT INTO sms_sends (phone, body, campaign, status, error)
    VALUES (${phone}, ${body}, ${campaign}, ${status}, ${error})
  `;
}

export interface UnsubRow {
  phone: string;
  source: string;
  unsubscribed_at: string;
}
export async function listUnsubscribes(limit = 200): Promise<UnsubRow[]> {
  await ensureSmsTables();
  return await sql<UnsubRow[]>`
    SELECT phone, source, to_char(unsubscribed_at, 'YYYY-MM-DD HH24:MI') AS unsubscribed_at
    FROM sms_unsubscribes
    ORDER BY unsubscribed_at DESC
    LIMIT ${limit}
  `;
}

export interface Recipient {
  name: string;
  phone: string;
}

/* Every contactable customer: a valid AU mobile, not opted out, deduped.
   Ordered stably (by phone) so paginated batch sends never skip or repeat. */
export async function getRecipients(): Promise<Recipient[]> {
  await ensureSmsTables();
  const rows = await sql<{ name: string; phone: string }[]>`
    SELECT DISTINCT ON (phone) name, phone FROM (
      SELECT name, phone FROM customers WHERE phone <> ''
    ) c
    ORDER BY phone
  `;
  const seen = new Set<string>();
  const out: Recipient[] = [];
  for (const r of rows) {
    const e164 = normalisePhone(r.phone);
    if (!isValidAuMobile(e164) || seen.has(e164)) continue;
    seen.add(e164);
    out.push({ name: r.name, phone: e164 });
  }
  if (out.length === 0) return out;
  // Drop opted-out numbers.
  const optedOut = await sql<{ phone: string }[]>`
    SELECT phone FROM sms_unsubscribes WHERE phone = ANY(${out.map((r) => r.phone)})
  `;
  const block = new Set(optedOut.map((r) => r.phone));
  return out.filter((r) => !block.has(r.phone));
}

export async function smsStats(): Promise<{
  contactable: number;
  unsubscribed: number;
  sentToday: number;
}> {
  await ensureSmsTables();
  const recips = await getRecipients();
  const [{ count: unsub }] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM sms_unsubscribes
  `;
  const [{ count: today }] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM sms_sends
    WHERE status = 'sent' AND created_at >= date_trunc('day', now() at time zone 'Australia/Brisbane')
  `;
  return { contactable: recips.length, unsubscribed: unsub, sentToday: today };
}
