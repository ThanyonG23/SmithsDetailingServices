/* Affiliate program (membership giveaway). Mirrors the Bring-a-Mate pattern:
   each affiliate gets a Stripe promotion code on a shared affiliate coupon (10%
   off the new member's first payment, a real perk + the attribution vehicle).
   The code carries an affiliate marker in metadata, so when a referred member is
   an active subscriber we can attribute them and pay the affiliate a recurring
   share of what that member pays, read live from Stripe. No separate tracking of
   who-paid-what needed, and the payout stops the moment a member cancels because
   we recount from live subscriptions every time. */

const API = "https://api.stripe.com/v1";
const LIVE = new Set(["active", "trialing", "past_due"]);
const STRIPE_VERSION = "2023-10-16";

// Recurring share of member revenue paid to the affiliate while the member stays.
export const REVSHARE = 0.25;

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
interface SCoupon { id: string; metadata?: Record<string, string> }
interface SPromo { id: string; code: string; metadata?: Record<string, string> }

let cachedCouponId: string | null = null;
async function getOrCreateAffiliateCoupon(): Promise<string | null> {
  if (cachedCouponId) return cachedCouponId;
  const list = await sGet<SList<SCoupon>>(`/coupons?limit=100`);
  const found = list?.data?.find((c) => c.metadata?.smiths_affiliate === "1");
  if (found) {
    cachedCouponId = found.id;
    return found.id;
  }
  const created = await sPost<SCoupon>(`/coupons`, {
    percent_off: "10",
    duration: "once",
    name: "Affiliate 10% off",
    "metadata[smiths_affiliate]": "1",
  });
  if (created?.id) {
    cachedCouponId = created.id;
    return created.id;
  }
  return null;
}

function base(name: string): string {
  const first = (name || "SMITHS").trim().split(/\s+/)[0] || "SMITHS";
  return first.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "SMITHS";
}
function candidates(name: string): string[] {
  const b = base(name);
  const two = () => String(Math.floor(Math.random() * 90) + 10);
  const three = () => String(Math.floor(Math.random() * 900) + 100);
  return [b, `${b}${two()}`, `${b}${two()}`, `${b}${three()}`];
}

/* Create the affiliate's Stripe promotion code (the code they share). Returns the
   code string, or null if Stripe isn't configured / all candidates were taken. */
export async function createAffiliatePromo(name: string): Promise<string | null> {
  if (!key()) return null;
  const coupon = await getOrCreateAffiliateCoupon();
  if (!coupon) return null;
  for (const code of candidates(name)) {
    const promo = await sPost<SPromo>(`/promotion_codes`, {
      coupon,
      code,
      "metadata[smiths_affiliate]": "1",
      "metadata[affiliate_name]": name || "",
    });
    if (promo?.code) return promo.code;
  }
  return null;
}

// ── earnings: live from active subscriptions carrying an affiliate promo code ──
interface SPrice { unit_amount?: number | null; recurring?: { interval?: string } | null }
interface SItem { price?: SPrice | null }
interface SDiscount { promotion_code?: SPromo | string | null }
interface SSub {
  status: string;
  items?: { data?: SItem[] } | null;
  discount?: SDiscount | null;
  discounts?: Array<SDiscount | string> | null;
}

function affiliateCodeOf(s: SSub): string | undefined {
  const fromDiscount = (d: SDiscount | null | undefined): string | undefined => {
    const pc = d?.promotion_code;
    if (pc && typeof pc === "object" && pc.metadata?.smiths_affiliate === "1") return pc.code;
    return undefined;
  };
  const legacy = fromDiscount(s.discount);
  if (legacy) return legacy;
  for (const d of s.discounts ?? []) {
    if (d && typeof d === "object") {
      const c = fromDiscount(d);
      if (c) return c;
    }
  }
  return undefined;
}

// Monthly-equivalent cents this subscription bills (annual plans /12).
function monthlyCents(s: SSub): number {
  const p = s.items?.data?.[0]?.price;
  const amt = p?.unit_amount || 0;
  return p?.recurring?.interval === "year" ? Math.round(amt / 12) : amt;
}

export type AffEarn = { members: number; monthlyCents: number };

export async function affiliateEarnings(): Promise<Record<string, AffEarn>> {
  const out: Record<string, AffEarn> = {};
  if (!key()) return out;
  let list = await sGet<SList<SSub>>(
    `/subscriptions?status=all&limit=100&expand[]=data.discounts.promotion_code&expand[]=data.items.data.price`,
  );
  if (!list) {
    list = await sGet<SList<SSub>>(
      `/subscriptions?status=all&limit=100&expand[]=data.discount.promotion_code&expand[]=data.items.data.price`,
    );
  }
  for (const s of (list?.data ?? []).filter((x) => LIVE.has(x.status))) {
    const code = affiliateCodeOf(s);
    if (!code) continue;
    const e = (out[code] ||= { members: 0, monthlyCents: 0 });
    e.members += 1;
    e.monthlyCents += monthlyCents(s);
  }
  return out;
}
