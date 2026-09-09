"use server";

import { createLoginToken, upsertMember } from "@/lib/members/db";
import { findMembership } from "@/lib/members/stripe";

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[a-z]{2,}(?:\.[a-z]{2,})?$/i;

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://smithsdetailingservices.com.au").replace(/\/$/, "");
}

async function sendMagicEmail(to: string, link: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // no email provider configured, skip silently
  const from = process.env.EMAIL_FROM || "Smiths <onboarding@resend.dev>";
  const text = `Here's your Smiths members sign-in link:

${link}

It's good for 30 minutes and can only be used once. If you didn't request this, you can ignore it.

Smiths`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to, subject: "Your Smiths members sign-in link", text }),
    });
  } catch {
    /* email is best-effort */
  }
}

/* Always returns the same message so we never reveal who is or isn't a member.
   Only actually sends a link if the email has a live Stripe subscription. */
export async function requestMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  const clean = String(email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(clean)) return { ok: false, error: "That email doesn't look right." };

  try {
    const membership = await findMembership(clean);
    if (membership) {
      await upsertMember({
        email: clean,
        name: membership.name,
        stripe_customer_id: membership.customerId,
        stripe_subscription_id: membership.subscriptionId,
        plan: membership.plan,
        status: membership.status,
        current_period_end: membership.currentPeriodEnd,
      });
      const token = await createLoginToken(clean);
      await sendMagicEmail(clean, `${siteUrl()}/account/verify?token=${token}`);
    }
  } catch {
    /* fall through to the generic response */
  }

  // Generic response either way, so membership status isn't leaked.
  return { ok: true };
}
