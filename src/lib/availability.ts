/* =====================================================================
   BOOKING AVAILABILITY, shared day-capacity logic
   ---------------------------------------------------------------------
   Same "a full day ≈ 2 correction-equivalents" model the /ops dashboard's
   Schedule panel already uses for real bookings from the calendar upload.
   Used by BOTH the /ops Schedule panel and the public Instant Quote widget
   so they always agree on which days have room.
   ===================================================================== */

import type { Booking } from "./ops/calendar";
import { getRecentBookings } from "./ops/db";
import { cairnsToday } from "./ops/config";
import { packageUnit, type PackageId, type VehicleSize } from "./packages";

const DAY_CAPACITY = 2;

/** Unit cost of an existing booked job (mirrors /ops's room-to-fill labels:
    a correction is 1 unit, a $700+ job is 0.5, anything smaller is 0.25). */
function jobUnit(j: Booking): number {
  return j.is_correction ? 1 : j.value >= 700 ? 0.5 : 0.25;
}

/** Units of room left on a given day, given the bookings that fall on it. */
export function roomOnDay(bookings: Booking[], date: string): number {
  const used = bookings
    .filter((b) => b.booking_date === date)
    .reduce((a, j) => a + jobUnit(j), 0);
  return DAY_CAPACITY - used;
}

/** Fixed daily drop-off slots, no per-booking time-of-day is captured from
    the calendar upload today, only the date, so we offer the business's
    standard slots on any day that has capacity. */
export const SLOTS = ["7:00am", "11:30am"];
const SLOT_MINUTES: Record<string, number> = { "7:00am": 7 * 60, "11:30am": 11 * 60 + 30 };

export interface AvailabilityDay {
  date: string;
  slots: string[];
}

function cairnsDatePlus(days: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(
    new Date(Date.now() + days * 86400000)
  );
}

/** Minutes since midnight, Cairns local time, right now. */
function cairnsMinutesNow(): number {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

/** For "today" (dayIndex 0), drop any slot that's already passed (or is
    less than an hour away, not realistically bookable). Every later day
    offers the full set. Without this, a customer checking the widget in
    the afternoon would still see "7:00am today" as an option. */
function slotsFor(dayIndex: number): string[] {
  if (dayIndex !== 0) return SLOTS;
  const now = cairnsMinutesNow();
  return SLOTS.filter((s) => SLOT_MINUTES[s] - now >= 60);
}

/** Next `wantDays` upcoming days that have room for the given package/size
    AND at least one bookable slot, searched over a bounded window so it can
    never loop forever if the calendar hasn't been uploaded in a while.
    NOTE: this only knows what's booked as of the last /ops calendar upload,    if today's real bookings haven't been uploaded yet, today can still look
    more open here than it actually is. */
export async function getUpcomingAvailability(
  packageId: PackageId,
  size: VehicleSize,
  wantDays = 5
): Promise<AvailabilityDay[]> {
  const required = packageUnit(packageId, size);
  const bookings = await getRecentBookings(cairnsToday());
  const out: AvailabilityDay[] = [];
  for (let i = 0; i < 21 && out.length < wantDays; i++) {
    const date = cairnsDatePlus(i);
    if (roomOnDay(bookings, date) >= required - 0.001) {
      const slots = slotsFor(i);
      if (slots.length) out.push({ date, slots });
    }
  }
  return out;
}
