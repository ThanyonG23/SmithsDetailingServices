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

/** Target LABOUR hours per job (total person-hours on the car). This is the
    CREW's KPI — "beat the clock" — and unlike a daily revenue target it's fully
    in their control (booking enough jobs is the owner's job, not theirs). Also
    the cycle-time lever. Calibrate these from real per-car data once the team
    clock is reliable; start firm-but-fair. */
export const TARGET_HOURS: { package: string; hours: number }[] = [
  { package: "Interior Only", hours: 2.5 },
  { package: "Standard Detail", hours: 3 },
  { package: "Premium Detail", hours: 3.5 },
  { package: "Premium + Polish", hours: 5.5 },
  { package: "Premium + Cut & Polish", hours: 10 },
  { package: "Correction & Coating", hours: 20 },
];

/** Extras add to a job's target time on top of the base package. */
export const EXTRA_HOURS: { name: string; hours: number }[] = [
  { name: "Headlights", hours: 1.5 },
  { name: "Touch-up paint", hours: 1 },
];

/** Best-guess target labour hours for a booking, from its package + any extras.
    Corrections are exact (the is_correction flag); the others fall back to price
    tiers because bookings don't store the package explicitly. Note: a
    "Free Interior Offer" is a Premium + Cut & Polish job. */
export function targetHoursForJob(job: {
  summary?: string;
  value?: number;
  is_correction?: boolean;
  extras?: string;
}): number {
  const s = `${job.summary || ""} ${job.extras || ""}`.toLowerCase();
  const v = job.value || 0;
  const hrs = (name: string) => TARGET_HOURS.find((t) => t.package === name)?.hours || 0;

  // Extras add on top of the base package (headlights, touch-up). Detected from
  // the text so an extra never inflates the BASE package guess.
  let extra = 0;
  if (/headlight/.test(s)) extra += EXTRA_HOURS.find((e) => e.name === "Headlights")?.hours || 0;
  if (/touch.?up/.test(s)) extra += EXTRA_HOURS.find((e) => e.name === "Touch-up paint")?.hours || 0;

  // Base package: trust the package NAME first (most reliable), and only fall
  // back to price when there's no name to go on. Price is unreliable on its own
  // because an extra bumps it into the next tier. "Free interior offer" is a
  // Premium + Cut & Polish job. Order matters: check "+ polish" before plain
  // "premium", and specific names before the price fallback.
  let base: number;
  if (job.is_correction || /correction|coating|ceramic|reset detail/.test(s)) {
    base = hrs("Correction & Coating");
  } else if (/cut ?&? ?polish|cut and polish|free interior/.test(s)) {
    base = hrs("Premium + Cut & Polish");
  } else if (/premium.*polish|\+\s*polish/.test(s)) {
    base = hrs("Premium + Polish");
  } else if (/premium/.test(s)) {
    base = hrs("Premium Detail");
  } else if (/standard/.test(s)) {
    base = hrs("Standard Detail");
  } else if (/interior/.test(s)) {
    base = hrs("Interior Only");
  } else if (v >= 1400) {
    base = hrs("Correction & Coating");
  } else if (v >= 800) {
    base = hrs("Premium + Cut & Polish");
  } else if (v >= 500) {
    base = hrs("Premium + Polish");
  } else if (v >= 380) {
    base = hrs("Premium Detail");
  } else {
    base = hrs("Interior Only");
  }
  return base + extra;
}

/** The team rallying cry, shown up top on the scoreboard. Change it any time. */
export const MOTTO = "If it was easy, everybody would do it.";

/** Crew performance bonus. Built into the team scoreboard but OFF until you're
    ready — flip `live` to true and the crew sees their live pot. `rate` = the
    share of revenue-above-break-even that goes into the crew pool (start small,
    scale to ~10% once a real P&L confirms break-even). See the parked design. */
export const BONUS = {
  live: false,
  rate: 0.1, // 10% of the above-break-even surplus, split across the detailers
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
