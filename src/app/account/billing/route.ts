import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/members/session";
import { getMember } from "@/lib/members/db";
import { findMembership, createBillingPortal } from "@/lib/members/stripe";

export const dynamic = "force-dynamic";

/* Opens Stripe's hosted billing portal for the signed-in member (cancel,
   update card, view invoices), then returns them to /account. */
export async function GET(req: Request) {
  const base = new URL(req.url).origin;
  const email = getSessionEmail();
  if (!email) return NextResponse.redirect(`${base}/account`, { status: 303 });

  let customerId = "";
  try {
    const cached = await getMember(email);
    customerId = cached?.stripe_customer_id || "";
    if (!customerId) {
      const live = await findMembership(email);
      customerId = live?.customerId || "";
    }
  } catch {
    customerId = "";
  }

  if (!customerId) return NextResponse.redirect(`${base}/account?e=billing`, { status: 303 });

  const portalUrl = await createBillingPortal(customerId, `${base}/account`);
  return NextResponse.redirect(portalUrl || `${base}/account?e=billing`, { status: 303 });
}
