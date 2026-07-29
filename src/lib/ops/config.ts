import { ACTIVE_TEAM } from "@/lib/referrals";

/* =====================================================================
   DAILY OPS — targets & roster
   ---------------------------------------------------------------------
   The break-even and aim come straight off the cost model:
     - breakEvenRevenue = the daily fixed nut on a 5-day week
     - aimRevenue       = a healthy day (≈2 corrections + a detail)
     - jobsTarget       = corrections/day we're aiming for
   Update these here if the cost base changes and the whole dashboard
   re-scores itself.
   ===================================================================== */
export const OPS_TARGETS = {
  breakEvenRevenue: 2319,
  aimRevenue: 4000,
  jobsTarget: 2,
};

/** Whose hours get logged each day: the team leader + every active
    detailer. Add or retire a detailer in referrals.ts and this stays
    in sync automatically. */
export const OPS_STAFF: string[] = ["Ashlee", ...ACTIVE_TEAM.map((m) => m.name)];

/** Today's date in Cairns (Australia/Brisbane — no daylight saving),
    as YYYY-MM-DD, so a log opened late at night still lands on the
    right day regardless of where the server is. */
export function cairnsToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Brisbane",
  }).format(new Date());
}

/** Hours between two "HH:MM" times on the same day (e.g. "06:45" → "17:30").
    Returns 0 if either is missing or the finish isn't after the start.
    Shared by the form (live preview) and the save action (what's stored). */
export function hoursBetween(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0;
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? Math.round((mins / 60) * 100) / 100 : 0;
}
