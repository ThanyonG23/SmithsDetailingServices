/* =====================================================================
   BOOKING AVAILABILITY — shared day-capacity logic
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

/** Fixed daily drop-off slots — no per-booking time-of-day is captured from
    the calendar upload today, only the date, so we offer the business's
    standard slots on any day that has capacity. */
export const SLOTS = ["7:00am", "11:30am"];

export interface AvailabilityDay {
  date: string;
  slots: string[];
}

function cairnsDatePlus(days: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(
    new Date(Date.now() + days * 86400000)
  );
}

/** Next `wantDays` upcoming days (today included) that have room for the
    given package/size, searched over a bounded window so it can never loop
    forever if the calendar hasn't been uploaded in a while. */
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
      out.push({ date, slots: SLOTS });
    }
  }
  return out;
}
