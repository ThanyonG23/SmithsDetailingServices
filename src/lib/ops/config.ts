import { ACTIVE_TEAM } from "@/lib/referrals";

/* =====================================================================
   DAILY OPS — targets & roster
   ---------------------------------------------------------------------
   Straight off the real bank-data cost model (3 detailers + team leader):
     - breakEvenRevenue = daily break-even (business covered), ~$48k/mo
     - aimRevenue       = the daily TARGET to beat break-even
     - weeklyTarget     = the target to run the week toward
     - monthlyTarget    = the target to run the month toward
     - jobsTarget       = corrections/day we're aiming for
   Update these here if the cost base changes and the whole dashboard
   re-scores itself.
   ===================================================================== */
export const OPS_TARGETS = {
  breakEvenRevenue: 2200,
  aimRevenue: 2500,
  weeklyTarget: 12500,
  monthlyTarget: 50000,
  jobsTarget: 2,
};

/** Hourly labour rate used to cost the day's crew hours (detailers). */
export const LABOUR_RATE = 32;

/** Salaried staff are a FIXED daily cost, NOT hourly — costing a manager at the
    detailer hourly rate badly understates their wage. Daily cost = annual salary
    / work days per year. Update the salary here as pay changes (Ashlee steps to
    $100,000 in month 2). */
export const SALARY_ANNUAL: Record<string, number> = { Ashlee: 90000 };
export const SALARY_WORK_DAYS = 260; // ~5 days/week
export function isSalaried(name: string): boolean {
  return (SALARY_ANNUAL[name] || 0) > 0;
}
export function dailySalaryCost(name: string): number {
  const annual = SALARY_ANNUAL[name] || 0;
  return annual > 0 ? Math.round(annual / SALARY_WORK_DAYS) : 0;
}

/** Whose hours get logged each day: the team leader + every active
    detailer. Add or retire a detailer in referrals.ts and this stays
    in sync automatically. */
export const OPS_STAFF: string[] = ["Ashlee", ...ACTIVE_TEAM.map((m) => m.name)];

/** Ashlee's daily run sheet — the tickable checklist on the dashboard.
    Keys are stable (don't rename) so saved ticks keep matching. */
export const RUN_SHEET: { key: string; label: string; phase: "Open" | "During" | "Close" }[] = [
  { key: "open", label: "Open up", phase: "Open" },
  { key: "setup", label: "Set up detailers — assign cars & brief", phase: "Open" },
  { key: "board", label: "Check the board — sort anything red first", phase: "Open" },
  { key: "detail", label: "Help detail / run the floor", phase: "During" },
  { key: "lead_answer", label: "Answer leads fast (minutes, not hours)", phase: "During" },
  { key: "lead_follow", label: "Follow up quoted-not-booked leads", phase: "During" },
  { key: "qc", label: "Quality-check every car before handover", phase: "During" },
  { key: "payment", label: "Take payment + record it", phase: "During" },
  { key: "checkins", label: "Customer check-ins (Happy / Not happy)", phase: "Close" },
  { key: "log", label: "Log the day on the board", phase: "Close" },
  { key: "cal", label: "Upload Google calendar (end of day)", phase: "Close" },
  { key: "ads", label: "Upload ad data — Ads tab (end of day)", phase: "Close" },
  { key: "stock", label: "Update stocktake — order anything low", phase: "Close" },
  { key: "tomorrow", label: "Fill tomorrow, then set the crew", phase: "Close" },
  { key: "lockup", label: "Lock up", phase: "Close" },
];

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
