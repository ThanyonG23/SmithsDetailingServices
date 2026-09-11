/* "Bring a Mate" referral program.

   Each member gets a unique Stripe promotion code that gives their mate 10% off
   their first payment (a single 10%-off, duration "once" coupon shared by all
   codes). The promo code carries the referrer's customer id in its metadata, so
   when a referred mate is an active member we can credit the referrer a bonus
   draw entry, read live from Stripe. No separate tracking table needed, and the
   bonus lasts only while the mate stays active because we recount every pull. */

const API = "https://api.stripe.com/v1";
const LIVE = new Set(["active", "trialing", "past_due"]);
// Pin to a stable API version so coupon/promotion-code create shapes stay
// predictable regardless of the account's (newer) default version.
const STRIPE_VERSION = "2023-10-16";

function key(): string | null {
  return process.env.STRIPE_SECRET_KEY || null;
}

async function sGet<T>(path: string): Promise<T | null> {
  const k = key();
  if (!k) return null;
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${k}`, "Stripe-Version": STRIPE_VERSION },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function sPost<T>(path: string, body: Record<string, string>): Promise<T | null> {
  const k = key();
  if (!k) return null;
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${k}`,
        "content-type": "application/x-www-form-urlencoded",
        "Stripe-Version": STRIPE_VERSION,
      },
      body: new URLSearchParams(body),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type SList<T> = { data: T[] };
interface SCoupon {
  id: string;
  metadata?: Record<string, string>;
}
interface SCustomer {
  id: string;
  name?: string | null;
  metadata?: Record<string, string>;
}
interface SPromo {
  id: string;
  code: string;
  metadata?: Record<string, string>;
}

// ── the shared 10%-off coupon ──
let cachedCouponId: string | null = null;

async function getOrCreateCoupon(): Promise<string | null> {
  if (cachedCouponId) return cachedCouponId;
  const list = await sGet<SList<SCoupon>>(`/coupons?limit=100`);
  const found = list?.data?.find((c) => c.metadata?.smiths_referral === "1");
  if (found) {
    cachedCouponId = found.id;
    return found.id;
  }
  const created = await sPost<SCoupon>(`/coupons`, {
    percent_off: "10",
    duration: "once", // 10% off the mate's first payment only
    name: "Bring a Mate 10% off",
    "metadata[smiths_referral]": "1",
  });
  if (created?.id) {
    cachedCouponId = created.id;
    return created.id;
  }
  return null;
}

function makeCode(name: string): string {
  const base = (name || "MATE").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "MATE";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

/* This member's referral code, created on first use and cached on the Stripe
   customer's metadata so we never mint duplicates. */
export async function getOrCreateReferralCode(customerId: string, name: string): Promise<string | null> {
  if (!key() || !customerId) return null;
  const cust = await sGet<SCustomer>(`/customers/${customerId}`);
  const existing = cust?.metadata?.referral_code;
  if (existing) return existing;

  const couponId = await getOrCreateCoupon();
  if (!couponId) return null;

  const who = name || cust?.name || "MATE";
  for (let i = 0; i < 4; i++) {
    const code = makeCode(who);
    const promo = await sPost<SPromo>(`/promotion_codes`, {
      coupon: couponId,
      code,
      "metadata[referrer_customer]": customerId,
      "metadata[referrer_name]": who,
    });
    if (promo?.code) {
      await sPost(`/customers/${customerId}`, { "metadata[referral_code]": promo.code });
      return promo.code;
    }
  }
  return null;
}

// ── attribution: who referred whom, among currently active members ──
interface SDiscount {
  promotion_code?: SPromo | string | null;
}
interface SSub {
  status: string;
  customer?: { id?: string } | string | null;
  discount?: SDiscount | null; // legacy single-discount API shape
  discounts?: Array<SDiscount | string> | null; // newer discounts-array shape
}

function subCustomerId(s: SSub): string | undefined {
  return typeof s.customer === "string" ? s.customer : s.customer?.id;
}

/* The referrer customer id stamped on this subscription's promo code, if any.
   Handles both the legacy `discount` object and the newer `discounts` array. */
function subReferrer(s: SSub): string | undefined {
  const fromDiscount = (d: SDiscount | null | undefined): string | undefined => {
    const pc = d?.promotion_code;
    return pc && typeof pc === "object" ? pc.metadata?.referrer_customer : undefined;
  };
  const legacy = fromDiscount(s.discount);
  if (legacy) return legacy;
  for (const d of s.discounts ?? []) {
    if (d && typeof d === "object") {
      const r = fromDiscount(d);
      if (r) return r;
    }
  }
  return undefined;
}

async function listActiveSubs(): Promise<SSub[]> {
  // Try the newer discounts-array shape first, then fall back to legacy discount.
  let list = await sGet<SList<SSub>>(
    `/subscriptions?status=all&limit=100&expand[]=data.customer&expand[]=data.discounts.promotion_code`,
  );
  if (!list) {
    list = await sGet<SList<SSub>>(
      `/subscriptions?status=all&limit=100&expand[]=data.customer&expand[]=data.discount.promotion_code`,
    );
  }
  return (list?.data ?? []).filter((s) => LIVE.has(s.status));
}

/* Map of referrer customer id -> number of active mates they brought in.
   Each active mate is one bonus entry for the referrer. Self-referrals ignored. */
export async function referralBonusByCustomer(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  if (!key()) return out;
  for (const s of await listActiveSubs()) {
    const ref = subReferrer(s);
    if (!ref || subCustomerId(s) === ref) continue;
    out[ref] = (out[ref] || 0) + 1;
  }
  return out;
}

/* Bonus entries this one member has earned (active mates referred). */
export async function countActiveReferrals(customerId: string): Promise<number> {
  if (!customerId) return 0;
  const map = await referralBonusByCustomer();
  return map[customerId] || 0;
}
