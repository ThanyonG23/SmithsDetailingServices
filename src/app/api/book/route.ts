import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import {
  BUSINESS,
  getPackage,
  getSlot,
  getExtra,
  extraPrice,
  basePrice,
  VEHICLE_KEYS,
  type VehicleKey,
} from "@/lib/config";
import { slotStartUtc, addMinutes } from "@/lib/time";
import { sendBookingEmails } from "@/lib/email";
import type { BookingRequest, PricedExtra, ResolvedBooking } from "@/lib/types";

export const dynamic = "force-dynamic";

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: BookingRequest;
  try {
    body = (await req.json()) as BookingRequest;
  } catch {
    return bad("Invalid request body");
  }

  // ---- validate selections ----
  const pkg = getPackage(body.package);
  if (!pkg) return bad("Please choose a package.");

  const vehicle = body.vehicle as VehicleKey;
  if (!VEHICLE_KEYS.includes(vehicle)) return bad("Please choose a vehicle type.");

  const slot = getSlot(body.slot);
  if (!slot) return bad("Please choose a time.");
  if (pkg.sevenAmOnly && slot.key !== "0700") {
    return bad("This package is only available at 7:00 AM.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date || "")) return bad("Please choose a date.");

  // ---- validate customer ----
  const c = body.customer || ({} as BookingRequest["customer"]);
  const name = String(c.name || "").trim();
  const email = String(c.email || "").trim();
  const phone = String(c.phone || "").trim();
  const notes = String(c.notes || "").trim();
  // Work is done at our workshop — store/show the shop location, not a customer address.
  const address = BUSINESS.address;

  if (!name) return bad("Please enter your name.");
  if (!EMAIL_RE.test(email)) return bad("Please enter a valid email.");
  if (!phone) return bad("Please enter your phone number.");

  // ---- compute times ----
  const start = slotStartUtc(body.date, slot.hour, slot.minute);
  const end = addMinutes(start, pkg.durationMin);
  if (isNaN(start.getTime())) return bad("Invalid date/time.");
  if (end.getTime() <= Date.now()) return bad("That time has already passed.");

  // ---- recompute prices SERVER-SIDE (never trust the browser) ----
  const base = basePrice(pkg, vehicle);
  const extras: PricedExtra[] = [];
  for (const key of Array.isArray(body.extras) ? body.extras : []) {
    const def = getExtra(String(key));
    if (!def) continue;
    // skip extras that aren't offered for this package (e.g. Hand Wax on Cut & Polish)
    if (def.onlyFor && !def.onlyFor.includes(pkg.key)) continue;
    extras.push({ key: def.key, label: def.label, price: extraPrice(def, vehicle) });
  }

  const extrasTotal = extras.reduce((sum, x) => sum + x.price, 0);
  const totalPrice = base + extrasTotal;

  const supabase = getServiceClient();

  // ---- race-condition recheck: is this exact slot still free? ----
  const { data: clashing, error: clashErr } = await supabase
    .from("bookings")
    .select("id")
    .eq("status", "confirmed")
    .lt("start_at", end.toISOString())
    .gt("end_at", start.toISOString())
    .limit(1);

  if (clashErr) return bad("Could not verify availability. Please try again.", 500);
  if (clashing && clashing.length > 0) {
    return bad("Sorry, that time was just taken. Please pick another slot.", 409);
  }

  // ---- insert ----
  const insertRow = {
    status: "confirmed",
    customer_name: name,
    email,
    phone,
    address,
    notes,
    vehicle,
    package_key: pkg.key,
    package_name: pkg.name,
    duration_min: pkg.durationMin,
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    slot: slot.key,
    extras,
    extras_total: extrasTotal,
    base_price: base,
    total_price: totalPrice,
    source: "website",
    gclid: body.attribution?.gclid || null,
    utm_source: body.attribution?.utm_source || null,
    utm_medium: body.attribution?.utm_medium || null,
    utm_campaign: body.attribution?.utm_campaign || null,
    landing_url: body.attribution?.landing_url || null,
    referrer: body.attribution?.referrer || null,
  };

  const { data: inserted, error: insErr } = await supabase
    .from("bookings")
    .insert(insertRow)
    .select("id")
    .single();

  if (insErr || !inserted) {
    return bad("Could not save your booking. Please try again or text us.", 500);
  }

  const resolved: ResolvedBooking = {
    bookingId: inserted.id,
    customerName: name,
    email,
    phone,
    address,
    notes,
    vehicle,
    packageKey: pkg.key,
    packageName: pkg.name,
    durationMin: pkg.durationMin,
    slot: slot.key,
    start,
    end,
    extras,
    extrasTotal,
    basePrice: base,
    totalPrice,
  };

  // Emails are best-effort and must not fail the booking.
  await sendBookingEmails(resolved);

  return NextResponse.json({ ok: true, bookingId: inserted.id, totalPrice });
}
