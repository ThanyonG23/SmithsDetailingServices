import { NextResponse } from "next/server";
import { insertWaitlist } from "@/lib/ops/db";
import { BUSINESS } from "@/lib/config";
import { GARAGE_SERVICE_IDS, MEMBERSHIP_NAME } from "@/lib/garage";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[a-z]{2,}(?:\.[a-z]{2,})?$/i;

/* Emails the shop inbox when someone joins the Smiths Garage waitlist, so a
   sign-up doesn't just sit in /ops waiting to be checked. Needs RESEND_API_KEY
   in Vercel; silently skipped (never blocks the customer) if unset or it fails. */
async function notifyOwner(w: {
  name: string; email: string; phone: string; vehicle: string;
  interests: string[]; membership: boolean; message: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.EMAIL_FROM || "Smiths Garage <onboarding@resend.dev>";
  const to = process.env.OWNER_EMAIL || BUSINESS.email;

  const text = `New Smiths Garage waitlist sign-up.

Name: ${w.name}
Phone: ${w.phone || "—"}
Email: ${w.email || "—"}
Vehicle: ${w.vehicle || "—"}

Interested in: ${w.interests.join(", ") || "—"}
Wants the ${MEMBERSHIP_NAME}: ${w.membership ? "YES" : "no"}
${w.message ? `\nMessage: ${w.message}\n` : ""}
It's also waiting in /ops on the dashboard.`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from,
        to,
        subject: `Smiths Garage waitlist — ${w.name}${w.membership ? " (wants membership)" : ""}`,
        text,
      }),
    });
  } catch {
    /* email is a convenience — the sign-up is already saved */
  }
}

/* Public, no-auth: stores a Smiths Garage waitlist sign-up in Supabase (the same
   DB the ops manager reads), so it shows up on the dashboard automatically. */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 200);
  const phone = String(body.phone || "").replace(/[^\d+ ]/g, "").trim().slice(0, 20);
  const vehicle = String(body.vehicle || "").trim().slice(0, 100);
  const message = String(body.message || "").trim().slice(0, 500);
  const membership = body.membership === true || body.membership === "true";
  const SOURCES = ["garage-waitlist", "membership-page", "membership-signup"];
  const source = SOURCES.includes(String(body.source)) ? String(body.source) : "garage-waitlist";
  // Only keep interests we recognise — never trust arbitrary strings from the browser.
  const interests = Array.isArray(body.interests)
    ? body.interests.map((p) => String(p)).filter((p) => GARAGE_SERVICE_IDS.includes(p)).slice(0, 12)
    : [];

  if (!name) {
    return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  }
  if (!email && !phone) {
    return NextResponse.json({ error: "Add an email or phone so we can reach you." }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  try {
    await insertWaitlist({ name, email, phone, vehicle, interests, membership, message, source });
    await notifyOwner({ name, email, phone, vehicle, interests, membership, message });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't save that — try again in a moment." }, { status: 502 });
  }
}
