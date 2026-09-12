"use server";

import { requireOwner } from "@/lib/ops/auth";
import { sql } from "@/lib/ops/db";
import { affiliateEarnings, REVSHARE } from "@/lib/members/affiliates";

/* Affiliate program admin. Each affiliate is a row here + a Stripe promotion code
   (their share link uses the code). Earnings are read live from Stripe every load,
   so payout owed is always current and stops when a referred member cancels. */

export type Affiliate = {
  id: number;
  code: string;
  name: string;
  email: string;
  members: number; // active referred members (live from Stripe)
  monthly_cents: number; // their recurring revenue base
  owed_cents: number; // monthly payout owed = base * REVSHARE
};

let ready = false;
async function ensure() {
  if (ready) return;
  await sql`CREATE TABLE IF NOT EXISTS affiliates (
    id serial PRIMARY KEY,
    code text UNIQUE NOT NULL,
    name text NOT NULL DEFAULT '',
    email text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS social text NOT NULL DEFAULT ''`;
  ready = true;
}

export async function revsharePct(): Promise<number> {
  return Math.round(REVSHARE * 100);
}

// Generate a short, unique affiliate code (first name based). No Stripe object,
// the code just identifies the affiliate for tracking; the audience perk is
// double entries in the draw, not a discount.
function codeBase(name: string): string {
  const first = (name || "SMITHS").trim().split(/\s+/)[0] || "SMITHS";
  return first.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "SMITHS";
}
async function generateCode(name: string): Promise<string> {
  const b = codeBase(name);
  const two = () => String(Math.floor(Math.random() * 90) + 10);
  const three = () => String(Math.floor(Math.random() * 900) + 100);
  for (const c of [b, `${b}${two()}`, `${b}${two()}`, `${b}${three()}`]) {
    const ex = (await sql`SELECT 1 FROM affiliates WHERE code = ${c} LIMIT 1`) as unknown as unknown[];
    if (ex.length === 0) return c;
  }
  return `${b}${Date.now().toString().slice(-4)}`;
}

export async function listAffiliates(): Promise<Affiliate[]> {
  requireOwner();
  await ensure();
  const rows = (await sql`SELECT id, code, name, email FROM affiliates ORDER BY id DESC`) as unknown as {
    id: number; code: string; name: string; email: string;
  }[];
  const earn = await affiliateEarnings();
  return rows.map((r) => {
    const e = earn[r.code] || { members: 0, monthlyCents: 0 };
    return {
      ...r,
      members: e.members,
      monthly_cents: e.monthlyCents,
      owed_cents: Math.round(e.monthlyCents * REVSHARE),
    };
  });
}

export async function createAffiliate(name: string, email: string): Promise<{ ok: boolean; error?: string; list?: Affiliate[] }> {
  requireOwner();
  await ensure();
  const nm = name.trim();
  if (!nm) return { ok: false, error: "Name is required." };
  const code = await generateCode(nm);
  await sql`INSERT INTO affiliates (code, name, email) VALUES (${code}, ${nm}, ${email.trim()})`;
  return { ok: true, list: await listAffiliates() };
}

export async function deleteAffiliate(id: number): Promise<Affiliate[]> {
  requireOwner();
  await ensure();
  await sql`DELETE FROM affiliates WHERE id = ${id}`;
  return listAffiliates();
}

// Public (no owner gate): does this affiliate code exist? Used by the /g/[code] landing.
export async function affiliateExists(code: string): Promise<boolean> {
  await ensure();
  const rows = (await sql`SELECT 1 FROM affiliates WHERE code = ${code} LIMIT 1`) as unknown as unknown[];
  return rows.length > 0;
}

/* Public self-serve signup from the /earn landing page. No owner gate: anyone can
   become an affiliate for free. Returns their new code. */
export async function signupAffiliate(
  name: string,
  email: string,
  social: string,
): Promise<{ ok: boolean; error?: string; code?: string }> {
  await ensure();
  const nm = name.trim();
  const em = email.trim();
  if (nm.length < 2) return { ok: false, error: "Please enter your name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return { ok: false, error: "Please enter a valid email." };
  const code = await generateCode(nm);
  await sql`INSERT INTO affiliates (code, name, email, social) VALUES (${code}, ${nm}, ${em}, ${social.trim()})`;
  return { ok: true, code };
}

/* Public (no owner gate): an affiliate's own stats, for their dashboard. The code
   is the key, stats are not sensitive. */
export async function getAffiliatePublic(
  code: string,
): Promise<{ name: string; code: string; members: number; owed_cents: number } | null> {
  await ensure();
  const rows = (await sql`SELECT name, code FROM affiliates WHERE code = ${code} LIMIT 1`) as unknown as {
    name: string; code: string;
  }[];
  if (!rows[0]) return null;
  const earn = await affiliateEarnings();
  const e = earn[code] || { members: 0, monthlyCents: 0 };
  return { name: rows[0].name, code: rows[0].code, members: e.members, owed_cents: Math.round(e.monthlyCents * REVSHARE) };
}
