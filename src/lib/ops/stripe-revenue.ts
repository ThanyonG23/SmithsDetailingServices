/* Pulls real payments from Stripe so the ops History can track Stripe revenue
   alongside the daily logs. Read-only: lists recent paid, non-refunded charges
   and totals them for this week and this month (Cairns time). Xero can slot in
   here later as a second source behind the same shape. */

const API = "https://api.stripe.com/v1";

function key(): string {
  return process.env.STRIPE_SECRET_KEY || "";
}

interface SCharge {
  paid?: boolean;
  refunded?: boolean;
  amount?: number; // cents
  created?: number; // unix seconds
  description?: string | null;
  billing_details?: { name?: string | null };
  customer_email?: string | null;
}
interface SList<T> {
  data: T[];
  has_more?: boolean;
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

export interface StripePayment {
  name: string;
  amount: number;
  dateMs: number;
  desc: string;
}
export interface StripeRevenue {
  configured: boolean;
  week: number;
  month: number;
  window: number;
  count: number;
  recent: StripePayment[];
}

// Start-of-month and Monday-of-week as real UTC ms, read in Cairns (UTC+10, no DST).
function cairnsBoundaries(): { monthStart: number; weekStart: number } {
  const shifted = new Date(Date.now() + 10 * 3600 * 1000); // UTC methods now read Brisbane wall time
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth();
  const d = shifted.getUTCDate();
  const dow = (shifted.getUTCDay() + 6) % 7; // 0 = Monday
  const monthStart = Date.UTC(y, m, 1) - 10 * 3600 * 1000;
  const dayStart = Date.UTC(y, m, d) - 10 * 3600 * 1000;
  const weekStart = dayStart - dow * 86400000;
  return { monthStart, weekStart };
}

/* Recent Stripe revenue. Fetches up to the last ~300 charges in the window
   (paginated), enough for a small business's month; totals week + month. */
export async function getStripeRevenue(days = 45): Promise<StripeRevenue> {
  if (!key()) return { configured: false, week: 0, month: 0, window: 0, count: 0, recent: [] };
  const since = Math.floor(Date.now() / 1000) - days * 24 * 3600;
  const { monthStart, weekStart } = cairnsBoundaries();

  const charges: SCharge[] = [];
  let after = "";
  for (let page = 0; page < 3; page++) {
    const q = `/charges?created[gte]=${since}&limit=100${after ? `&starting_after=${after}` : ""}`;
    const data = await sGet<SList<SCharge>>(q);
    const rows = data?.data ?? [];
    charges.push(...rows);
    if (!data?.has_more || rows.length === 0) break;
    // starting_after wants the last object id; charges include an id field.
    after = (rows[rows.length - 1] as unknown as { id?: string }).id || "";
    if (!after) break;
  }

  let week = 0;
  let month = 0;
  let windowTotal = 0;
  const recent: StripePayment[] = [];
  for (const c of charges) {
    if (!c.paid || c.refunded) continue;
    const amount = (c.amount || 0) / 100;
    const dateMs = (c.created || 0) * 1000;
    windowTotal += amount;
    if (dateMs >= monthStart) month += amount;
    if (dateMs >= weekStart) week += amount;
    recent.push({
      name: (c.billing_details?.name || c.customer_email || "Customer").trim(),
      amount,
      dateMs,
      desc: (c.description || "").trim(),
    });
  }
  recent.sort((a, b) => b.dateMs - a.dateMs);
  return { configured: true, week, month, window: windowTotal, count: recent.length, recent: recent.slice(0, 50) };
}
