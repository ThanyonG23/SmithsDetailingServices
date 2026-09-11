import { NextResponse } from "next/server";
import { isOwner } from "@/lib/ops/auth";

export const dynamic = "force-dynamic";

const API = "https://api.stripe.com/v1";

/* Owner-only diagnostic for the referral program. Log in at /ops first.
   Shows the key type and the raw Stripe response to a test coupon create,
   so we can see exactly why code creation is failing. */
export async function GET() {
  if (!isOwner()) {
    return NextResponse.json({ error: "Log in at /ops as owner first." }, { status: 403 });
  }

  const sk = process.env.STRIPE_SECRET_KEY || "";
  const keyType = sk.startsWith("sk_live_")
    ? "secret-live"
    : sk.startsWith("sk_test_")
      ? "secret-test"
      : sk.startsWith("rk_live_")
        ? "restricted-live"
        : sk.startsWith("rk_test_")
          ? "restricted-test"
          : sk
            ? "unknown-format"
            : "missing";

  const out: Record<string, unknown> = { keyType, keyPrefix: sk.slice(0, 8) };

  if (!sk) return NextResponse.json(out);

  // 1. Can we read coupons?
  try {
    const r = await fetch(`${API}/coupons?limit=1`, {
      headers: { Authorization: `Bearer ${sk}` },
      cache: "no-store",
    });
    out.readCoupons = { status: r.status };
    if (!r.ok) out.readCouponsBody = await r.text();
  } catch (e) {
    out.readCoupons = { error: String(e) };
  }

  // 2. Create a coupon and keep its id for the promo-code test.
  let couponId = "";
  try {
    const r = await fetch(`${API}/coupons`, {
      method: "POST",
      headers: { Authorization: `Bearer ${sk}`, "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        percent_off: "10",
        duration: "once",
        name: "Referral debug (safe to delete)",
        "metadata[smiths_referral_debug]": "1",
      }),
      cache: "no-store",
    });
    out.createCoupon = { status: r.status };
    const body = await r.text();
    out.createCouponBody = body.slice(0, 400);
    try {
      couponId = (JSON.parse(body) as { id?: string }).id || "";
    } catch {
      /* ignore */
    }
  } catch (e) {
    out.createCoupon = { error: String(e) };
  }

  // 3. Create a promotion code under that coupon (the step that's failing live).
  if (couponId) {
    try {
      const code = `DEBUG${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const r = await fetch(`${API}/promotion_codes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sk}`, "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          coupon: couponId,
          code,
          "metadata[referrer_customer]": "cus_debug",
          "metadata[referrer_name]": "Debug",
        }),
        cache: "no-store",
      });
      out.createPromo = { status: r.status, code };
      const body = await r.text();
      out.createPromoBody = body.slice(0, 400);
    } catch (e) {
      out.createPromo = { error: String(e) };
    }

    // 3b. Retry the promo code WITH a pinned Stripe-Version (the actual fix).
    try {
      const code = `DEBUGV${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const r = await fetch(`${API}/promotion_codes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sk}`,
          "content-type": "application/x-www-form-urlencoded",
          "Stripe-Version": "2023-10-16",
        },
        body: new URLSearchParams({ coupon: couponId, code }),
        cache: "no-store",
      });
      out.createPromoPinned = { status: r.status, code };
      const body = await r.text();
      out.createPromoPinnedBody = body.slice(0, 400);
    } catch (e) {
      out.createPromoPinned = { error: String(e) };
    }
  }

  return NextResponse.json(out);
}
