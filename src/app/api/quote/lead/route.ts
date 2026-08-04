import { NextResponse } from "next/server";
import { insertQuoteLead } from "@/lib/ops/db";
import { SLOTS } from "@/lib/availability";
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
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't save that — try again in a moment." }, { status: 502 });
  }
}
