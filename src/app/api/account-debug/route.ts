import { NextResponse } from "next/server";
import { isOwner } from "@/lib/ops/auth";
import { findMembership, countCustomers } from "@/lib/members/stripe";
import { createLoginToken, upsertMember } from "@/lib/members/db";

export const dynamic = "force-dynamic";

/* Owner-only diagnostic for the member portal. Log in at /ops first.
   ?email=... shows what the portal sees.
   ?email=...&send=1 actually runs the send and reports where it fails. */
export async function GET(req: Request) {
  if (!isOwner()) {
    return NextResponse.json({ error: "Log in at /ops as owner first." }, { status: 403 });
  }

  const url = new URL(req.url);
  const email = url.searchParams.get("email") || "";
  const doSend = url.searchParams.get("send") === "1";
  const sk = process.env.STRIPE_SECRET_KEY || "";
  const stripeKey = sk.startsWith("sk_live_") ? "live" : sk.startsWith("sk_test_") ? "test" : sk ? "unknown-format" : "missing";

  if (doSend && email) {
    const steps: Record<string, unknown> = {};
    try {
      const m = await findMembership(email);
      steps.memberFound = !!m;
      if (m) {
        await upsertMember({
          email: email.toLowerCase(),
          name: m.name,
          stripe_customer_id: m.customerId,
          stripe_subscription_id: m.subscriptionId,
          plan: m.plan,
          status: m.status,
          current_period_end: m.currentPeriodEnd,
        });
        steps.dbUpsert = "ok";
        const token = await createLoginToken(email.toLowerCase());
        steps.dbTokenCreated = !!token;

        const apiKey = process.env.RESEND_API_KEY || "";
        const from = process.env.EMAIL_FROM || "Smiths <onboarding@resend.dev>";
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            from,
            to: email,
            subject: "Smiths sign-in link (test)",
            text: `Test sign-in link: https://smithsdetailingservices.com.au/account/verify?token=${token}`,
          }),
        });
        steps.resendStatus = res.status;
        steps.resendResponse = (await res.text()).slice(0, 600);
      }
    } catch (e) {
      steps.error = String(e);
    }
    return NextResponse.json({ send: true, from: process.env.EMAIL_FROM || "(default)", ...steps });
  }

  let customers = 0;
  let member: Awaited<ReturnType<typeof findMembership>> = null;
  if (email) {
    customers = await countCustomers(email);
    member = await findMembership(email);
  }

  return NextResponse.json({
    email,
    stripeKey,
    resendKey: process.env.RESEND_API_KEY ? "set" : "missing",
    emailFrom: process.env.EMAIL_FROM || "(default onboarding@resend.dev)",
    customersMatched: customers,
    memberFound: !!member,
    status: member?.status ?? null,
    plan: member?.plan ?? null,
  });
}
