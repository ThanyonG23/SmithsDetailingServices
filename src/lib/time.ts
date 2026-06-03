/* =====================================================================
   TIMEZONE-SAFE HELPERS
   Cairns (QLD) is Australia/Brisbane = UTC+10 all year (no daylight saving).
   We convert local Cairns wall-clock times to true UTC instants so that
   availability + calendar work correctly no matter where the server runs.
   ===================================================================== */

export const TZ = "Australia/Brisbane";
const TZ_OFFSET_MIN = 10 * 60; // +10:00, no DST

/** Build the real UTC instant for a Cairns-local date + time. */
export function slotStartUtc(dateStr: string, hour: number, minute: number): Date {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  const utcMs = Date.UTC(y, m - 1, d, hour, minute, 0) - TZ_OFFSET_MIN * 60000;
  return new Date(utcMs);
}

export function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60000);
}

/** Today's date in Cairns as YYYY-MM-DD (for date-input min + defaults). */
export function todayInCairns(): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function formatCairnsDate(date: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatCairnsTime(date: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/** Compact UTC stamp for .ics files: 20260615T210000Z */
export function toIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
