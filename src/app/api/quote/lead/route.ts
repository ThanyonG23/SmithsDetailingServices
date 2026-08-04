import { NextResponse } from "next/server";
import { insertQuoteLead } from "@/lib/ops/db";
import { SLOTS } from "@/lib/availability";
import { BUSINESS } from "@/lib/config";
import {
  VEHICLE_SIZES,
  PACKAGE_TITLES,
  packagePrice,
  type PackageId,
  type VehicleSize,
} from "@/lib/packages";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

const PACKAGE_IDS: PackageId[] = ["interior", "premium", "cutpolish", "correction"];
const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[a-z]{2,}(?:\.[a-z]{2,})?$/i;

function dayLabel(d: string): string {
  return new Date(`${d}T00:00:00+10:00`).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Brisbane",
  });
}

/* Emails the new pending lead to the shop inbox so Ashlee can confirm it and
   send the calendar invite — same info that lands in /ops, just pushed to
   her inbox too instead of only waiting to be checked. Needs RESEND_API_KEY
   set in Vercel; silently skipped (never blocks the customer's request) if
   it's not configured or the send fails for any reason. */
async function notifyOwner(lead: {
  name: string;
  email: string;
  phone: string;
  vehicleText: string;
  size: VehicleSize;
  packageTitle: string;
  price: number;
  priorities: string[];
  requestedDate: string;
  requestedSlot: string;
  referralCode: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.EMAIL_FROM || "Smiths Instant Quote <onboarding@resend.dev>";
  const to = process.env.OWNER_EMAIL || BUSINESS.email;

  const text = `New request from the Instant Quote widget on the website.

Name: ${lead.name}
Phone: ${lead.phone || "—"}
Email: ${lead.email || "—"}

Vehicle: ${lead.vehicleText} (${lead.size})
Package: ${lead.packageTitle} — $${lead.price.toLocaleString("en-AU")}
Priorities: ${lead.priorities.join(", ") || "—"}

Requested: ${dayLabel(lead.requestedDate)} — ${lead.requestedSlot}
${lead.referralCode ? `Referral: ${lead.referralCode.toUpperCase()}\n` : ""}
This is a PENDING request, not a confirmed booking — call or text ${
    lead.phone || lead.email
  } to confirm, then create the Google Calendar event as usual. It's also
waiting in /ops on the dashboard.`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from,
        to,
        subject: `New Instant Quote request — ${lead.vehicleText} (${lead.packageTitle})`,
        text,
      }),
    });
  } catch {
    /* email is a convenience notification — the lead is already saved */
  }
}

/* Public, no-auth: creates a PENDING lead from the homepage Instant Quote
   widget. Never touches the Google Calendar — Ashlee confirms every booking
   manually via the /ops dashboard, same as the existing text-to-quote flow. */
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
  const vehicleText = String(body.vehicle_text || "").trim().slice(0, 100);
  const size = String(body.vehicle_size || "") as VehicleSize;
  const packageId = String(body.package_id || "") as PackageId;
  const requestedDate = String(body.requested_date || "").slice(0, 10);
  const requestedSlot = String(body.requested_slot || "").slice(0, 20);
  const referralCode = String(body.referral_code || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  const priorities = Array.isArray(body.priorities)
    ? body.priorities.map((p) => String(p)).slice(0, 4)
    : [];

  if (!name || !vehicleText) {
    return NextResponse.json({ error: "Name and vehicle are required." }, { status: 400 });
  }
  if (!email && !phone) {
    return NextResponse.json({ error: "An email or phone number is required." }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }
  if (!VEHICLE_SIZES.includes(size)) {
    return NextResponse.json({ error: "Invalid vehicle size." }, { status: 400 });
  }
  if (!PACKAGE_IDS.includes(packageId)) {
    return NextResponse.json({ error: "Invalid package." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate) || !SLOTS.includes(requestedSlot)) {
    return NextResponse.json({ error: "Please pick a day and time." }, { status: 400 });
  }

  // Price/title are recomputed server-side from the package tables — never
  // trust a price sent by the browser.
  const price = packagePrice(packageId, size);
  const packageTitle = PACKAGE_TITLES[packageId];

  try {
    await insertQuoteLead({
      name,
      email,
      phone,
      vehicle_text: vehicleText,
      vehicle_size: size,
      priorities,
      package_id: packageId,
      package_title: packageTitle,
      price,
      requested_date: requestedDate,
      requested_slot: requestedSlot,
      referral_code: referralCode,
    });
    await notifyOwner({
      name,
      email,
      phone,
      vehicleText,
      size,
      packageTitle,
      price,
      priorities,
      requestedDate,
      requestedSlot,
      referralCode,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't save that — try again in a moment." }, { status: 502 });
  }
}
