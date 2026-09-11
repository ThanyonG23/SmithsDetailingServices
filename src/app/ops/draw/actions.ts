"use server";

import { isOwner } from "@/lib/ops/auth";
import { sql } from "@/lib/ops/db";

/* Assembles the current draw entrant list, weighted by tier, from three
   sources so nothing is missed: active subscriptions (all tiers), 30-day
   passes bought in the last 30 days, and free "no purchase necessary" entries.
   Names are repeated by their entry count so a uniform pick weights correctly.
   Eligibility comes from payment (Stripe) + the free-entry table, never from
   whether someone created a portal login. */

const API = "https://api.stripe.com/v1";
const LIVE = new Set(["active", "trialing", "past_due"]);
const PASS_AMOUNT = 999; // $9.99 one-off 30-day pass, in cents

interface SCustomer {
  name?: string | null;
  email?: string | null;
}
interface SPrice {
  unit_amount?: number | null;
}
interface SSub {
  status: string;
  customer?: SCustomer | string | null;
  items?: { data: { price?: SPrice }[] };
}
interface SCharge {
  paid?: boolean;
  refunded?: boolean;
  invoice?: string | null;
  amount?: number;
  billing_details?: { name?: string | null };
  customer_email?: string | null;
}
interface SList<T> {
  data: T[];
}

function key(): string {
  return process.env.STRIPE_SECRET_KEY || "";
}

async function sGet<T>(path: string): Promise<T | null> {
  if (!key()) return null;
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${key()}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function entriesForAmount(a: number | null | undefined): number {
  const n = a ?? 0;
  if (n >= 12000) return 10; // Platinum yearly
  if (n >= 9000) return 5; // Annual $99
  if (n >= 2000) return 5; // Platinum monthly $24.99
  return 1; // $9.99 member / pass
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function pullEntrants(): Promise<{ ok: boolean; names?: string[]; summary?: string; error?: string }> {
  if (!isOwner()) return { ok: false, error: "Not authorised, log in to /ops." };
  if (!key()) return { ok: false, error: "Stripe key isn't set in Vercel." };

  const names: string[] = [];
  let memberCount = 0;
  let memberEntries = 0;
  let passCount = 0;
  let freeCount = 0;

  try {
    // 1. Active subscriptions (all tiers), weighted by tier.
    const subs = await sGet<SList<SSub>>(`/subscriptions?status=all&limit=100&expand[]=data.customer`);
    for (const s of subs?.data ?? []) {
      if (!LIVE.has(s.status)) continue;
      const cust = s.customer && typeof s.customer === "object" ? s.customer : null;
      const nm = (cust?.name || cust?.email || "Member").trim();
      const e = entriesForAmount(s.items?.data?.[0]?.price?.unit_amount);
      for (let i = 0; i < e; i++) names.push(nm);
      memberCount++;
      memberEntries += e;
    }

    // 2. 30-day passes: one-off charges (no invoice) at the pass price, last 30 days.
    const since = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
    const charges = await sGet<SList<SCharge>>(`/charges?created[gte]=${since}&limit=100`);
    for (const c of charges?.data ?? []) {
      if (!c.paid || c.refunded || c.invoice) continue; // skip unpaid, refunded, and subscription renewals
      if (c.amount !== PASS_AMOUNT) continue;
      const nm = (c.billing_details?.name || c.customer_email || "Pass holder").trim();
      names.push(nm);
      passCount++;
    }

    // 3. Free entries from the no-purchase-necessary page, last 30 days.
    try {
      const rows = (await sql`SELECT name FROM free_entries WHERE created_at > now() - interval '30 days'`) as unknown as { name: string }[];
      for (const r of rows) {
        names.push((r.name || "").trim() || "Free entry");
        freeCount++;
      }
    } catch {
      /* free_entries table may not exist yet; ignore */
    }
  } catch {
    return { ok: false, error: "Couldn't pull from Stripe, try again." };
  }

  const total = names.length;
  if (total === 0) return { ok: false, error: "No entrants found for the current period." };

  const summary =
    `Pulled ${memberCount} member${memberCount === 1 ? "" : "s"} (${memberEntries} entries), ` +
    `${passCount} pass${passCount === 1 ? "" : "es"}, ${freeCount} free entr${freeCount === 1 ? "y" : "ies"} — ` +
    `${total} total entries in the draw.`;

  return { ok: true, names: shuffle(names), summary };
}
