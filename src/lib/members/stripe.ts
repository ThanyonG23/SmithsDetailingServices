/* Thin Stripe REST client (no SDK dependency). Needs STRIPE_SECRET_KEY set in
   Vercel. Used to verify a member's subscription and to open Stripe's hosted
   billing portal. Returns null gracefully when the key is missing.

   Stripe's customer email filter is case-sensitive and emails are stored as
   entered at checkout, so we try the raw and lower-cased forms. */

const API = "https://api.stripe.com/v1";

type StripeList<T> = { data: T[] };
interface StripeCustomer {
  id: string;
  name?: string | null;
  email?: string | null;
}
interface StripePrice {
  id: string;
  nickname?: string | null;
  unit_amount?: number | null;
  recurring?: { interval?: string } | null;
}
interface StripeSubscription {
  id: string;
  status: string;
  current_period_end?: number;
  items?: { data: { price?: StripePrice }[] };
}

function key(): string | null {
  return process.env.STRIPE_SECRET_KEY || null;
}

async function stripeGet<T>(path: string): Promise<T | null> {
  const k = key();
  if (!k) return null;
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${k}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type Membership = {
  customerId: string;
  subscriptionId: string;
  plan: string;
  status: string; // active | trialing | past_due | ...
  currentPeriodEnd: string | null;
  entries: number; // free draw entries this tier gets
  name: string;
};

/* Free draw entries by tier, derived from the price so it can't drift:
   $9.99 member / pass = 1, $99 annual = 5, $24.99 Platinum = 5, $199 Platinum yearly = 10. */
function entriesForAmount(amount: number | null | undefined): number {
  const a = amount ?? 0;
  if (a >= 12000) return 10;
  if (a >= 9000) return 5;
  if (a >= 2000) return 5;
  return 1;
}

export function stripeReady(): boolean {
  return key() !== null;
}

const LIVE = new Set(["active", "trialing", "past_due"]);

// Friendly names for our known price IDs, so the portal never shows a raw price id.
const PLAN_NAMES: Record<string, string> = {
  price_1U7uBeDKvWtA0gmHV4y9V2zg: "Smiths Member",
};

type SubInfo = { subscriptionId: string; plan: string; status: string; currentPeriodEnd: string | null; entries: number };

async function liveSubForCustomer(customerId: string): Promise<SubInfo | null> {
  const subs = await stripeGet<StripeList<StripeSubscription>>(
    `/subscriptions?customer=${customerId}&status=all&limit=10`,
  );
  const live = subs?.data?.find((s) => LIVE.has(s.status));
  if (!live) return null;
  const price = live.items?.data?.[0]?.price;
  const priceId = price?.id || "";
  return {
    subscriptionId: live.id,
    plan: price?.nickname || PLAN_NAMES[priceId] || "Smiths Membership",
    status: live.status,
    currentPeriodEnd: live.current_period_end
      ? new Date(live.current_period_end * 1000).toISOString()
      : null,
    entries: entriesForAmount(price?.unit_amount),
  };
}

/** Find a live subscription by email. Stripe's email filter is case-sensitive,
    so we try the fast filtered path first, then fall back to a case-insensitive
    scan of recent customers (fine at our scale; a webhook-fed table later). */
export async function findMembership(email: string): Promise<Membership | null> {
  if (!key()) return null;
  const target = email.trim().toLowerCase();

  // Fast path: exact email filter (raw + lower-cased forms).
  const variants = Array.from(new Set([email.trim(), target]));
  for (const v of variants) {
    const custs = await stripeGet<StripeList<StripeCustomer>>(
      `/customers?email=${encodeURIComponent(v)}&limit=10`,
    );
    for (const c of custs?.data ?? []) {
      const sub = await liveSubForCustomer(c.id);
      if (sub) return { customerId: c.id, name: c.name || "", ...sub };
    }
  }

  // Fallback: case-insensitive scan (handles capitals stored at checkout).
  const all = await stripeGet<StripeList<StripeCustomer>>(`/customers?limit=100`);
  for (const c of all?.data ?? []) {
    if ((c.email || "").trim().toLowerCase() === target) {
      const sub = await liveSubForCustomer(c.id);
      if (sub) return { customerId: c.id, name: c.name || "", ...sub };
    }
  }
  return null;
}

/** Re-check a known customer's live subscription (used on the dashboard).
    Re-reads the customer's current name from Stripe so renames show up. */
export async function findMembershipByCustomer(customerId: string): Promise<Membership | null> {
  if (!key() || !customerId) return null;
  const sub = await liveSubForCustomer(customerId);
  if (!sub) return null;
  const cust = await stripeGet<StripeCustomer>(`/customers/${customerId}`);
  return { customerId, name: cust?.name || "", ...sub };
}

/** Count matching customers for an email (diagnostics only). */
export async function countCustomers(email: string): Promise<number> {
  if (!key()) return 0;
  const trimmed = email.trim();
  const variants = Array.from(new Set([trimmed, trimmed.toLowerCase()]));
  let n = 0;
  for (const v of variants) {
    const custs = await stripeGet<StripeList<StripeCustomer>>(
      `/customers?email=${encodeURIComponent(v)}&limit=10`,
    );
    n += custs?.data?.length ?? 0;
  }
  return n;
}

export async function createBillingPortal(customerId: string, returnUrl: string): Promise<string | null> {
  const k = key();
  if (!k) return null;
  try {
    const res = await fetch(`${API}/billing_portal/sessions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${k}`, "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ customer: customerId, return_url: returnUrl }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { url?: string };
    return j.url || null;
  } catch {
    return null;
  }
}
