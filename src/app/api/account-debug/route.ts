import { NextResponse } from "next/server";
import { isOwner } from "@/lib/ops/auth";
import { findMembership, countCustomers } from "@/lib/members/stripe";

export const dynamic = "force-dynamic";

/* Owner-only diagnostic for the member portal. Log in at /ops first, then hit
   /api/account-debug?email=someone@example.com to see what the portal sees.
   Never returns secrets, only presence/mode and match results. */
export async function GET(req: Request) {
  if (!isOwner()) {
    return NextResponse.json({ error: "Log in at /ops as owner first." }, { status: 403 });
  }

  const email = new URL(req.url).searchParams.get("email") || "";
  const sk = process.env.STRIPE_SECRET_KEY || "";
  const stripeKey = sk.startsWith("sk_live_")
    ? "live"
    : sk.startsWith("sk_test_")
      ? "test"
      : sk
        ? "unknown-format"
        : "missing";

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
