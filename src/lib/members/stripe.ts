/* Thin Stripe REST client (no SDK dependency). Needs STRIPE_SECRET_KEY set in
   Vercel. Used to verify a member's subscription by email and to open Stripe's
   hosted billing portal. Returns null gracefully when the key is missing. */

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
  name: string;
};

/** Whether Stripe is configured for the portal at all. */
export function stripeReady(): boolean {
  return key() !== null;
}

const LIVE = new Set(["active", "trialing", "past_due"]);

/** Find a live subscription for the given email, or null. */
export async function findMembership(email: string): Promise<Membership | null> {
  if (!key()) return null;
  const custs = await stripeGet<StripeList<StripeCustomer>>(
    `/customers?email=${encodeURIComponent(email.toLowerCase().trim())}&limit=10`,
  );
  if (!custs?.data?.length) return null;

  for (const c of custs.data) {
    const subs = await stripeGet<StripeList<StripeSubscription>>(
      `/subscriptions?customer=${c.id}&status=all&limit=10`,
    );
    const live = subs?.data?.find((s) => LIVE.has(s.status));
    if (live) {
      const price = live.items?.data?.[0]?.price;
      return {
        customerId: c.id,
        subscriptionId: live.id,
        plan: price?.nickname || price?.id || "Membership",
        status: live.status,
        currentPeriodEnd: live.current_period_end
          ? new Date(live.current_period_end * 1000).toISOString()
          : null,
        name: c.name || "",
      };
    }
  }
  return null;
}

/** Whether any customer exists for this email (used to decide if we email a link). */
export async function emailHasMembership(email: string): Promise<boolean> {
  return (await findMembership(email)) !== null;
}

/** Create a Stripe billing-portal session, returns the URL to redirect to. */
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
