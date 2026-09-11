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

  // 2. Can we create a coupon? (this is the step that's failing)
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
    out.createCouponBody = body.slice(0, 800);
  } catch (e) {
    out.createCoupon = { error: String(e) };
  }

  return NextResponse.json(out);
}
