import Link from "next/link";
import { requireOwner } from "@/lib/ops/auth";
import {
  getRecentBookings,
  getAds,
  getJobsForDate,
  getCarryoverJobs,
  getFollowups,
  getRectifyList,
  getSatisfaction,
  getReorderCount,
  getChecklist,
  getQuoteLeads,
  getQuoteLeadStats,
  getWaitlist,
  getWaitlistStats,
  getCancellationStats,
  getDashSummary,
  type Booking,
  type AdRow,
  type JobWithHours,
  type JobFollowup,
  type QuoteLead,
  type WaitlistEntry,
  type DashSummary,
} from "@/lib/ops/db";
import { GARAGE_SERVICES } from "@/lib/garage";
import { OPS_TARGETS, cairnsToday } from "@/lib/ops/config";
import { logout, logJobHours, setCheckin, markQuoteLeadActioned, markWaitlistActioned } from "./actions";

const SERVICE_LABEL: Record<string, string> = Object.fromEntries(
  GARAGE_SERVICES.map((s) => [s.id, s.name]),
);
import RunSheet from "@/components/ops/RunSheet";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const dayLabel = (d: string) =>
  new Date(`${d}T00:00:00+10:00`).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Australia/Brisbane",
  });

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <div className={EYEBROW}>{eyebrow}</div>
      <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-white">{title}</h2>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "green" | "yellow";
}) {
  const accent =
    tone === "green" ? "before:bg-brand-green" : tone === "yellow" ? "before:bg-brand-yellow" : "before:bg-white/20";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] ${accent}`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className="mt-1.5 font-display text-2xl font-extrabold tabular-nums text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-white/45">{sub}</div>}
    </div>
  );
}

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export default async function OpsPage({
  searchParams,
}: {
  searchParams: { jobsok?: string; fuok?: string };
}) {
  requireOwner();

  const today = cairnsToday();
  const dateLabel = new Date(`${today}T00:00:00+10:00`).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Brisbane",
  });
  const monthStartISO = today.slice(0, 7) + "-01";
  const wt = new Date(`${today}T12:00:00+10:00`);
  const dow = (wt.getUTCDay() + 6) % 7; // 0 = Monday
  const brisDate = (ms: number) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(new Date(ms));
  const weekStart = brisDate(wt.getTime() - dow * 86400000);
  const from60 = brisDate(Date.now() - 60 * 86400000);
  const d14 = brisDate(Date.now() - 13 * 86400000);
  const fu3 = brisDate(Date.now() - 3 * 86400000);

  let bookings: Booking[] = [];
  let ads: AdRow[] = [];
  let todaysJobs: JobWithHours[] = [];
  let carryover: JobWithHours[] = [];
  let followups: JobFollowup[] = [];
  let rectifyList: JobFollowup[] = [];
  let satisfaction = { happy: 0, unhappy: 0 };
  let reorderCount = 0;
  let checklist: string[] = [];
  let quoteLeads: QuoteLead[] = [];
  let quoteLeadStats = { total: 0, pending: 0, actioned: 0 };
  let waitlist: WaitlistEntry[] = [];
  let waitlistStats = { total: 0, pending: 0, actioned: 0, members: 0 };
  let cancelStats = { week: 0, month: 0 };
  let dash: DashSummary = {
    weekRev: 0, weekInv: 0, monthRev: 0, monthInv: 0, weekLeads: 0, monthLeads: 0, salesLoaded: null, leadsLoaded: null,
  };
  let dbError = false;

  // Run-sheet ticks load first on their own budget, the one thing touched all
  // day, so a slow aggregate below can't wipe them off the screen.
  try {
    checklist = await Promise.race([
      getChecklist(today),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 15000)),
    ]);
  } catch {
    /* leave [] */
  }

  try {
    // Sequential on the single pooled connection (parallel deadlocks the pooler).
    const data = await Promise.race([
      (async () => ({
        bookings: await getRecentBookings(from60),
        ads: await getAds(),
        todaysJobs: await getJobsForDate(today),
        carryover: await getCarryoverJobs(today, d14),
        followups: await getFollowups(fu3, today),
        rectifyList: await getRectifyList(),
        satisfaction: await getSatisfaction(monthStartISO, today),
        reorderCount: await getReorderCount(),
        quoteLeads: await getQuoteLeads("pending"),
        quoteLeadStats: await getQuoteLeadStats(),
        waitlist: await getWaitlist("pending"),
        waitlistStats: await getWaitlistStats(),
        cancelStats: await getCancellationStats(weekStart, monthStartISO, today),
        dash: await getDashSummary(weekStart, monthStartISO, today),
      }))(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 20000)),
    ]);
    ({
      bookings, ads, todaysJobs, carryover, followups, rectifyList,
      satisfaction, reorderCount, quoteLeads, quoteLeadStats, waitlist, waitlistStats, cancelStats, dash,
    } = data);
  } catch {
    dbError = true;
  }

  // ── derived (bookings + uploads only, no manual data) ──
  const { aimRevenue, weeklyTarget, monthlyTarget } = OPS_TARGETS;
  const monthPct = Math.min(100, Math.round((dash.monthRev / monthlyTarget) * 100));
  const weekPct = Math.min(100, Math.round((dash.weekRev / weeklyTarget) * 100));

  const last14 = bookings.filter((b) => b.booking_date >= d14 && b.booking_date <= today);
  const corrPerDay = last14.filter((b) => b.is_correction).length / 10;
  const pipeline = bookings.filter((b) => b.booking_date > today);
  const pipelineCorr = pipeline.filter((b) => b.is_correction).length;
  const pipelineCorrValue = pipeline.filter((b) => b.is_correction).reduce((a, b) => a + b.value, 0);
  const hasBookings = bookings.length > 0;
  const adSpend = ads.reduce((a, r) => a + r.spend, 0);
  const hasAds = ads.length > 0;

  const floorJobs = [
    ...todaysJobs,
    ...carryover.filter((c) => !todaysJobs.some((t) => t.uid === c.uid)),
  ];
  const jobsOk = searchParams?.jobsok;

  const upcoming = bookings.filter((b) => b.booking_date >= today);
  const scheduleByDay = new Map<string, Booking[]>();
  for (const b of upcoming) {
    const arr = scheduleByDay.get(b.booking_date) || [];
    arr.push(b);
    scheduleByDay.set(b.booking_date, arr);
  }
  const scheduleDays = [...scheduleByDay.keys()].sort().slice(0, 12);

  const dueFollowups = followups.filter((f) => f.booking_date < today);
  const pendingFollowupList = dueFollowups.filter((f) => f.status === "pending");
  const pendingFollowups = pendingFollowupList.length;
  const fuOk = searchParams?.fuok;

  // ── alerts (auto only) ──
  const alerts: { tone: "red" | "yellow"; text: string }[] = [];
  if (quoteLeads.length > 0)
    alerts.push({ tone: "red", text: `${quoteLeads.length} new AI Instant Quote request(s) waiting, confirm or call them back.` });
  if (waitlist.length > 0)
    alerts.push({ tone: "yellow", text: `${waitlist.length} new Smiths Garage waitlist sign-up(s)${waitlistStats.members > 0 ? ` (${waitlistStats.members} want the membership)` : ""}, reach out while they're warm.` });
  if (rectifyList.length > 0)
    alerts.push({ tone: "red", text: `${rectifyList.length} unhappy customer(s) need a rectify job booked, sort it before it becomes a review.` });
  if (pendingFollowups > 0)
    alerts.push({ tone: "yellow", text: `${pendingFollowups} recent customer(s) not checked in yet, send the day-after "how'd it go?" and tick them off.` });
  if (reorderCount > 0)
    alerts.push({ tone: "yellow", text: `${reorderCount} item(s) low on stock, reorder before you run out.` });
  if (hasBookings && pipelineCorr === 0)
    alerts.push({ tone: "red", text: "No corrections booked ahead, push the correction ad or work warm leads before the bay goes quiet." });
  else if (hasBookings && pipelineCorr <= 2)
    alerts.push({ tone: "yellow", text: `Only ${pipelineCorr} correction(s) booked ahead, thin pipeline, keep the correction ad feeding it.` });

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      {/* ── header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={EYEBROW}>Smiths Detailing · Cairns</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-5xl">
            Daily <span className="text-brand-green">Ops</span>
          </h1>
          <p className="mt-3 text-sm font-semibold text-white/50">
            {dateLabel}
            <span className="ml-2 text-brand-green">· Today</span>
          </p>
        </div>
        <form action={logout}>
          <button className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/60 transition hover:border-white/35 hover:text-white">
            Log out
          </button>
        </form>
      </div>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          <b className="font-bold">Database didn&apos;t respond.</b> It may be waking up, wait a minute and refresh.
        </div>
      )}
      {jobsOk && (
        <div className="mt-5 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-2.5 text-sm font-semibold text-brand-green">Hours saved ✓</div>
      )}
      {fuOk && (
        <div className="mt-5 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-2.5 text-sm font-semibold text-brand-green">Check-in saved ✓</div>
      )}

      {/* ── THIS WEEK / MONTH, auto from your uploads ── */}
      <section className="mt-7 grid gap-4 xl:grid-cols-3 xl:items-start">
        {/* month hero */}
        <div className={`relative rounded-3xl border p-6 sm:p-7 xl:col-span-2 ${dash.monthRev >= monthlyTarget ? "border-brand-green/40 bg-brand-green/[0.05]" : "border-white/10 bg-white/[0.02]"}`}>
          <div className="flex items-center justify-between">
            <div className={EYEBROW}>Revenue this month · real, from Xero</div>
            <div className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white/45">
              {dash.monthInv} invoices
            </div>
          </div>
          <div className="mt-3 font-display text-6xl font-extrabold leading-none tabular-nums text-white sm:text-7xl">
            {money(dash.monthRev)}
          </div>
          <div className="mt-1.5 text-sm font-semibold text-white/45">
            This week <span className="text-white/80">{money(dash.weekRev)}</span> · {dash.weekInv} job{dash.weekInv === 1 ? "" : "s"}
          </div>
          <div className="relative mt-6 h-3.5 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full ${dash.monthRev >= monthlyTarget ? "bg-brand-green" : "bg-brand-yellow"}`} style={{ width: `${monthPct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-bold text-white/45">
            <span>{monthPct}% of month target</span>
            <span>Target {money(monthlyTarget)}</span>
          </div>
        </div>
        {/* week + auto stats */}
        <div className="grid grid-cols-2 gap-3 xl:content-start">
          <Stat label="This week" value={money(dash.weekRev)} sub={`${weekPct}% of ${money(weeklyTarget)}`} tone={dash.weekRev >= weeklyTarget ? "green" : "neutral"} />
          <Stat label="Corrections ahead" value={String(pipelineCorr)} sub={pipelineCorrValue > 0 ? `${money(pipelineCorrValue)} booked` : "keep the pipeline full"} tone={pipelineCorr >= 3 ? "green" : "yellow"} />
          <Stat label="Leads this week" value={String(dash.weekLeads)} sub={`${dash.monthLeads} this month`} />
          <Stat label="Ad spend" value={hasAds ? money(adSpend) : "-"} sub="last ads upload" />
        </div>
      </section>
      <p className="mt-2 text-[11px] text-white/35">
        Auto-tracked from your uploads{dash.salesLoaded ? ` · sales loaded ${dash.salesLoaded}` : ""}. Drop the day&apos;s
        files on the <Link href="/ops/uploads" className="font-bold text-white/55 underline-offset-2 hover:underline">Uploads</Link> tab
        and these update, full breakdown on <Link href="/ops/analytics" className="font-bold text-white/55 underline-offset-2 hover:underline">Analytics</Link>.
      </p>

      {/* ── ALERTS ── */}
      {alerts.length > 0 && (
        <section className="mt-8 flex flex-col gap-2">
          <div className={EYEBROW}>Fix these today</div>
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 rounded-xl border px-4 py-2.5 text-sm ${a.tone === "red" ? "border-red-500/40 bg-red-500/[0.08] text-red-300" : "border-brand-yellow/40 bg-brand-yellow/[0.07] text-brand-yellow"}`}
            >
              <span aria-hidden>{a.tone === "red" ? "🔴" : "🟡"}</span>
              <span>{a.text}</span>
            </div>
          ))}
        </section>
      )}

      {/* ── AI INSTANT QUOTE LEADS ── */}
      {quoteLeadStats.total > 0 && (
        <section className="mt-8">
          <SectionTitle eyebrow="From the homepage" title="AI Instant Quote requests" />
          <div className={`${CARD} mb-3 px-4 py-3 text-sm text-white/70`}>
            <b className="text-white">{quoteLeadStats.total}</b>{" "}
            {quoteLeadStats.total === 1 ? "person has" : "people have"} got a quote through the widget and not booked{" · "}
            <b className="text-brand-green">{quoteLeadStats.pending}</b> new to chase
            {quoteLeadStats.actioned > 0 && <span className="text-white/40">{` · ${quoteLeadStats.actioned} already followed up`}</span>}
          </div>
          {quoteLeads.length > 0 && (
            <div className="flex flex-col gap-3">
              {quoteLeads.map((q) => (
                <div key={q.id} className={`${CARD} p-4`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-base font-extrabold tracking-tight text-white">
                        {q.name || "(no name)"} · {q.vehicle_text || "vehicle unknown"}
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        {q.package_title} ({q.vehicle_size}) · {money(q.price)}
                        {q.requested_date && ` · wants ${dayLabel(q.requested_date)} ${q.requested_slot}`}
                        {q.referral_code && ` · Ref: ${q.referral_code.toUpperCase()}`}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
                        {q.phone && <a href={`tel:${q.phone}`} className="font-bold text-brand-green">📞 {q.phone}</a>}
                        {q.email && <a href={`mailto:${q.email}`} className="text-white/60 hover:text-white">✉️ {q.email}</a>}
                      </div>
                    </div>
                    <form action={markQuoteLeadActioned}>
                      <input type="hidden" name="id" value={q.id} />
                      <button className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white/70 transition hover:border-brand-green hover:text-brand-green">
                        Actioned ✓
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── SMITHS GARAGE WAITLIST ── */}
      {waitlistStats.total > 0 && (
        <section className="mt-8">
          <SectionTitle eyebrow="Smiths Garage · coming soon" title="Waitlist sign-ups" />
          <div className={`${CARD} mb-3 px-4 py-3 text-sm text-white/70`}>
            <b className="text-white">{waitlistStats.total}</b>{" "}
            {waitlistStats.total === 1 ? "person" : "people"} on the waitlist{" · "}
            <b className="text-brand-green">{waitlistStats.pending}</b> new to reach out to
            {waitlistStats.members > 0 && <span className="text-brand-yellow">{` · ${waitlistStats.members} want the membership`}</span>}
            {waitlistStats.actioned > 0 && <span className="text-white/40">{` · ${waitlistStats.actioned} already contacted`}</span>}
          </div>
          {waitlist.length > 0 && (
            <div className="flex flex-col gap-3">
              {waitlist.map((w) => (
                <div key={w.id} className={`${CARD} p-4`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-base font-extrabold tracking-tight text-white">
                        {w.name || "(no name)"}
                        {w.vehicle && <span className="text-white/50"> · {w.vehicle}</span>}
                        {w.membership && (
                          <span className="ml-2 rounded-full bg-brand-yellow/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-yellow">
                            Membership
                          </span>
                        )}
                      </div>
                      {w.interests.length > 0 && (
                        <div className="mt-1 text-xs text-white/50">
                          Wants: {w.interests.map((i) => SERVICE_LABEL[i] || i).join(" · ")}
                        </div>
                      )}
                      {w.message && <div className="mt-1 text-xs italic text-white/45">“{w.message}”</div>}
                      <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
                        {w.phone && <a href={`tel:${w.phone}`} className="font-bold text-brand-green">📞 {w.phone}</a>}
                        {w.email && <a href={`mailto:${w.email}`} className="text-white/60 hover:text-white">✉️ {w.email}</a>}
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${w.source === "membership-signup" ? "bg-brand-green/15 text-brand-green" : "bg-white/5 text-white/40"}`}>
                          {w.source === "membership-signup" ? "Signed up ✍️" : w.source === "membership-page" ? "Membership page" : "Garage waitlist"}
                        </span>
                        <span className="text-white/30">{w.created_at.replace("T", " ")}</span>
                      </div>
                    </div>
                    <form action={markWaitlistActioned}>
                      <input type="hidden" name="id" value={w.id} />
                      <button className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white/70 transition hover:border-brand-green hover:text-brand-green">
                        Contacted ✓
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── RUN SHEET ── */}
      <div className="mt-8">
        <RunSheet key={today} today={today} initial={checklist} />
      </div>

      {/* ── SCHEDULE + TODAY'S JOBS ── */}
      <div className="mt-8 grid gap-6 xl:grid-cols-2 xl:items-start">
        {/* schedule */}
        <section>
          <SectionTitle eyebrow="What's booked" title="Schedule" />
          {scheduleDays.length === 0 ? (
            <p className="text-sm text-white/45">Nothing upcoming, upload the latest calendar on the Uploads tab.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {scheduleDays.map((d) => {
                const jobs = scheduleByDay.get(d) || [];
                const total = jobs.reduce((a, j) => a + j.value, 0);
                const corr = jobs.filter((j) => j.is_correction).length;
                const toTarget = Math.max(0, aimRevenue - total);
                return (
                  <div key={d} className={`${CARD} p-4`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-display text-base font-extrabold tracking-tight text-white">
                        {dayLabel(d)}
                        {d === today && <span className="ml-2 rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-green">Today</span>}
                      </div>
                      <div className="shrink-0 text-xs font-semibold text-white/50">
                        {jobs.length} · {money(total)}
                        {corr > 0 && <span className="text-brand-green"> · {corr} corr</span>}
                      </div>
                    </div>
                    {toTarget > 0 ? (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/[0.12] px-2.5 py-1 text-[11px] font-bold text-red-300">
                        🔴 Need {money(toTarget)} more to hit target
                      </div>
                    ) : (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-green/15 px-2.5 py-1 text-[11px] font-bold text-brand-green">🎯 Target hit ✓</div>
                    )}
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      {jobs.map((j, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-black/20 px-3 py-2">
                          <span className="min-w-0 flex-1 truncate text-sm text-white/80">{j.summary || "(no title)"}</span>
                          <span className="shrink-0 text-xs font-bold tabular-nums text-white/55">
                            {money(j.value)}
                            {j.is_correction && <span className="ml-1.5 text-brand-green">●</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* today's jobs, hours per car */}
        <section>
          <SectionTitle eyebrow="On the floor today" title="Today's jobs" />
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs text-white/55">
            <span aria-hidden>🚫</span>
            <span>
              No-shows / cancellations:{" "}
              <b className={cancelStats.week > 0 ? "text-red-300" : "text-white/70"}>{cancelStats.week}</b> this week{" · "}
              <b className={cancelStats.month > 0 ? "text-red-300" : "text-white/70"}>{cancelStats.month}</b> this month
              {" · "}😊 {satisfaction.happy} / {satisfaction.unhappy} 🙁 (mo)
            </span>
          </div>
          {floorJobs.length === 0 ? (
            <p className="text-sm text-white/45">No jobs on the calendar for today, upload the latest calendar if that looks wrong.</p>
          ) : (
            <form action={logJobHours} className={`${CARD} p-4`}>
              <div className="flex flex-col gap-2">
                {floorJobs.map((j) => {
                  const carried = j.booking_date < today;
                  const total = Math.round((j.hours || 0) * 100) / 100;
                  return (
                    <div
                      key={j.uid}
                      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-black/30 px-3 py-2.5 ${j.cancelled ? "border-red-500/40 opacity-60" : carried ? "border-brand-yellow/30" : "border-white/10"}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className={`truncate text-sm font-semibold ${j.cancelled ? "text-white/50 line-through" : "text-white/85"}`}>{j.summary || "(no title)"}</div>
                        <div className="text-xs text-white/40">
                          {money(j.value)}
                          {j.cancelled && <span className="ml-1.5 font-bold text-red-300">· no-show</span>}
                          {j.is_correction && <span className="ml-1.5 font-bold text-brand-green">· correction</span>}
                          {carried && <span className="ml-1.5 font-semibold text-brand-yellow">· carried from {dayLabel(j.booking_date)}</span>}
                          {total > 0 && <span className="ml-1.5 text-white/55">· {total}h total</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <input
                          type="number"
                          name={`jh::${j.uid}`}
                          defaultValue={j.hours_today || ""}
                          min={0}
                          step="any"
                          inputMode="decimal"
                          placeholder="0"
                          aria-label={`Hours today for ${j.summary}`}
                          className="w-16 rounded-lg border border-white/12 bg-black/50 px-2 py-2 text-right text-sm text-white outline-none focus:border-brand-green"
                        />
                        <span className="text-xs font-semibold text-white/40">hrs</span>
                      </div>
                      <input type="hidden" name={`job::${j.uid}`} value="1" />
                      <label className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-bold transition ${j.finished ? "border-brand-green/50 bg-brand-green/10 text-brand-green" : "border-white/12 text-white/60 hover:border-brand-green hover:text-brand-green"}`}>
                        <input type="checkbox" name={`fin::${j.uid}`} defaultChecked={j.finished} className="h-3.5 w-3.5 accent-brand-green" />
                        Done
                      </label>
                      <label className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-bold transition ${j.cancelled ? "border-red-500/50 bg-red-500/10 text-red-300" : "border-white/12 text-white/60 hover:border-red-500/60 hover:text-red-300"}`}>
                        <input type="checkbox" name={`cancel::${j.uid}`} defaultChecked={j.cancelled} className="h-3.5 w-3.5 accent-red-500" />
                        No-show
                      </label>
                      <textarea
                        name={`note::${j.uid}`}
                        defaultValue={j.note}
                        rows={1}
                        placeholder="Notes for the crew, what's left, anything to rectify…"
                        className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-xs text-white/80 outline-none placeholder:text-white/25 focus:border-brand-green"
                      />
                    </div>
                  );
                })}
              </div>
              <button className="mt-3 rounded-full bg-brand-green px-6 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
                Save hours &amp; notes
              </button>
            </form>
          )}
        </section>
      </div>

      {/* ── CHECK-INS ── */}
      <section className="mt-8">
        <SectionTitle eyebrow="Customer care" title="Check-ins" />
        {rectifyList.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-red-300">🔧 Rectify jobs to book</div>
            <div className="flex flex-col gap-2">
              {rectifyList.map((f) => (
                <div key={f.uid} className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white/85">{f.summary || "(no title)"}</div>
                    <div className="text-xs text-white/40">{dayLabel(f.booking_date)} · {money(f.value)} · unhappy</div>
                  </div>
                  <form action={setCheckin}>
                    <input type="hidden" name="uid" value={f.uid} />
                    <button name="outcome" value="rectified" className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white/70 transition hover:border-brand-green hover:text-brand-green">
                      Rectify sorted ✓
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}
        {dueFollowups.length === 0 ? (
          <p className="text-sm text-white/45">Nothing due, check-ins show here the day after a car is done.</p>
        ) : pendingFollowupList.length === 0 ? (
          <p className="text-sm font-semibold text-brand-green">All recent customers checked in ✓, nice work.</p>
        ) : (
          <>
            <p className="mb-3 text-xs leading-relaxed text-white/45">
              Message each the day after. <b className="text-white/70">Happy</b> clears it, <b className="text-white/70">Not happy</b> books a rectify job.
            </p>
            <div className={`${CARD} flex flex-col gap-2 p-4`}>
              {pendingFollowupList.map((f) => (
                <div key={f.uid} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white/85">{f.summary || "(no title)"}</div>
                    <div className="text-xs text-white/40">{dayLabel(f.booking_date)} · {money(f.value)}</div>
                  </div>
                  <form action={setCheckin} className="flex shrink-0 gap-1.5">
                    <input type="hidden" name="uid" value={f.uid} />
                    <button name="outcome" value="happy" className="rounded-full bg-brand-green px-3 py-1.5 text-[11px] font-black text-[#04130a] transition hover:brightness-110 active:scale-95">😊 Happy</button>
                    <button name="outcome" value="unhappy" className="rounded-full border border-red-500/40 bg-red-500/[0.12] px-3 py-1.5 text-[11px] font-bold text-red-300 transition hover:bg-red-500/20">Not happy</button>
                  </form>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <p className="mt-16 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
