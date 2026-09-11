"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createLoginToken,
  consumeLoginToken,
  upsertMember,
  getMember,
  verifyPassword,
  hashPassword,
  setMemberPassword,
} from "@/lib/members/db";
import { findMembership } from "@/lib/members/stripe";
import { getOrCreateReferralCode, countActiveReferrals } from "@/lib/members/referrals";
import { MEMBER_COOKIE, memberCookieValue, getSessionEmail } from "@/lib/members/session";

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
  const raw = String(email || "").trim();
  const clean = raw.toLowerCase();
  if (!EMAIL_RE.test(clean)) return { ok: false, error: "That email doesn't look right." };

  try {
    const membership = await findMembership(raw);
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

const SESSION_COOKIE = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

/** Email + password sign-in. Members must have set a password first (via the
    magic-link entry). */
export async function loginWithPassword(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const clean = String(email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(clean)) return { ok: false, error: "Enter a valid email." };
  if (!password) return { ok: false, error: "Enter your password." };
  try {
    const member = await getMember(clean);
    if (!member || !member.password_hash) {
      return { ok: false, error: 'No password set for this email yet. Use "Email me a link" below, then set one.' };
    }
    if (!verifyPassword(password, member.password_hash)) {
      return { ok: false, error: "Wrong email or password." };
    }
    cookies().set(MEMBER_COOKIE, memberCookieValue(clean), SESSION_COOKIE);
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong, try again." };
  }
}

/** Consume a magic-link token (only on this human POST) and start the session. */
export async function confirmLogin(formData: FormData): Promise<void> {
  const token = String(formData.get("token") || "");
  const email = token ? await consumeLoginToken(token) : null;
  if (!email) redirect("/account?e=link");
  cookies().set(MEMBER_COOKIE, memberCookieValue(email), SESSION_COOKIE);
  redirect("/account");
}

/** Get (creating on first use) the signed-in member's referral code, the join
    link to share, and how many active mates they've brought in so far. */
export async function ensureReferral(): Promise<{
  ok: boolean;
  code?: string;
  link?: string;
  mates?: number;
  error?: string;
}> {
  const email = getSessionEmail();
  if (!email) return { ok: false, error: "Please sign in first." };
  try {
    const member = await getMember(email);
    const cid = member?.stripe_customer_id;
    if (!cid) return { ok: false, error: "We couldn't find your membership yet, try again in a moment." };
    const code = await getOrCreateReferralCode(cid, member?.name || "");
    if (!code) return { ok: false, error: "Couldn't set up your code, try again." };
    const mates = await countActiveReferrals(cid);
    return { ok: true, code, link: `${siteUrl()}/membership`, mates };
  } catch {
    return { ok: false, error: "Something went wrong, try again." };
  }
}

/** Set or change the signed-in member's password. */
export async function setPassword(password: string): Promise<{ ok: boolean; error?: string }> {
  const email = getSessionEmail();
  if (!email) return { ok: false, error: "Please sign in first." };
  const pw = String(password || "");
  if (pw.length < 8) return { ok: false, error: "Use at least 8 characters." };
  try {
    await setMemberPassword(email, hashPassword(pw));
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save that, try again." };
  }
}
