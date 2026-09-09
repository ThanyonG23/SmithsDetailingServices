import { sql } from "@/lib/ops/db";
import { createHash, randomBytes } from "crypto";

/* Member portal storage: a cache of member status (synced from Stripe) and
   the one-time magic-link login tokens. Reads run sequentially, the pooler
   deadlocks on parallel queries. */

let ensured: Promise<void> | null = null;
function ensure(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS members (
          email text PRIMARY KEY,
          name text DEFAULT '',
          stripe_customer_id text DEFAULT '',
          stripe_subscription_id text DEFAULT '',
          plan text DEFAULT '',
          status text DEFAULT '',
          current_period_end timestamptz,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS member_tokens (
          token_hash text PRIMARY KEY,
          email text NOT NULL,
          expires_at timestamptz NOT NULL,
          used boolean DEFAULT false,
          created_at timestamptz DEFAULT now()
        )`;
    })().catch((e) => {
      ensured = null;
      throw e;
    });
  }
  return ensured;
}

export type Member = {
  email: string;
  name: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
};

export async function upsertMember(m: Partial<Member> & { email: string }): Promise<void> {
  await ensure();
  const email = m.email.toLowerCase().trim();
  await sql`
    INSERT INTO members (email, name, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, updated_at)
    VALUES (${email}, ${m.name ?? ""}, ${m.stripe_customer_id ?? ""}, ${m.stripe_subscription_id ?? ""}, ${m.plan ?? ""}, ${m.status ?? ""}, ${m.current_period_end ?? null}, now())
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      current_period_end = EXCLUDED.current_period_end,
      updated_at = now()`;
}

export async function getMember(email: string): Promise<Member | null> {
  await ensure();
  const rows = await sql`
    SELECT email, name, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end
    FROM members WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
  return (rows[0] as Member) ?? null;
}

function hashToken(t: string): string {
  return createHash("sha256").update(t).digest("hex");
}

/** Create a single-use magic-link token for an email. Returns the raw token. */
export async function createLoginToken(email: string, ttlMinutes = 30): Promise<string> {
  await ensure();
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + ttlMinutes * 60_000).toISOString();
  await sql`INSERT INTO member_tokens (token_hash, email, expires_at) VALUES (${hashToken(token)}, ${email.toLowerCase().trim()}, ${expires})`;
  return token;
}

/** Consume a magic-link token. Returns the email if valid & unused, else null. */
export async function consumeLoginToken(token: string): Promise<string | null> {
  await ensure();
  const h = hashToken(token);
  const rows = await sql`SELECT email, expires_at, used FROM member_tokens WHERE token_hash = ${h} LIMIT 1`;
  const row = rows[0] as { email: string; expires_at: string; used: boolean } | undefined;
  if (!row || row.used) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  await sql`UPDATE member_tokens SET used = true WHERE token_hash = ${h}`;
  return row.email;
}
