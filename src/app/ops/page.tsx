import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/ops/auth";
import {
  getDailyLog,
  getRecentLogs,
  getRecentBookings,
  getAds,
  type DailyLog,
  type Booking,
  type AdRow,
} from "@/lib/ops/db";
import { OPS_STAFF, OPS_TARGETS, cairnsToday } from "@/lib/ops/config";
import { saveEntry, logout, uploadCalendar, uploadAds } from "./actions";
import StaffHours from "@/components/ops/StaffHours";
import Reveal from "@/components/Reveal";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");

function totalHours(e: DailyLog | null): number {
  if (!e) return 0;
  return Object.values(e.staff_hours || {}).reduce((a, b) => a + Number(b || 0), 0);
}

function revenueStatus(rev: number) {
  const { breakEvenRevenue, aimRevenue } = OPS_TARGETS;
  if (rev <= 0) return { label: "Nothing logged yet", tone: "neutral" as const };
  if (rev >= aimRevenue) return { label: "Smashing the aim", tone: "green" as const };
  if (rev >= breakEvenRevenue) return { label: "Above break-even", tone: "green" as const };
  return { label: "Below the line", tone: "yellow" as const };
}

/* --- brand tokens ----------------------------------------------------- */
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const FIELD =
  "w-full rounded-xl border border-white/12 bg-black/40 text-white outline-none transition placeholder:text-white/25 focus:border-brand-green";

/* --- helpers ---------------------------------------------------------- */

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <div className={EYEBROW}>{eyebrow}</div>
      <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-white">
        {title}
      </h2>
    </div>
  );
}

function NumField({
  label,
  name,
  defaultValue,
  prefix,
  step = 1,
}: {
  label: string;
  name: string;
  defaultValue?: number | string;
  prefix?: string;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
        {label}
      </span>
      <div className="flex items-center rounded-xl border border-white/12 bg-black/40 transition focus-within:border-brand-green">
        {prefix && <span className="pl-3 font-semibold text-white/35">{prefix}</span>}
        <input
          type="number"
          name={name}
          defaultValue={defaultValue}
          min={0}
          step={step}
          inputMode="decimal"
          placeholder="0"
          className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-white/20"
        />
      </div>
    </label>
  );
}

function PaceCard({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const hit = current >= target;
  return (
    <div
      className={`rounded-2xl border p-5 ${
        hit ? "border-brand-green/40 bg-brand-green/[0.05]" : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
          {label}
        </div>
        <div className="text-xs font-bold text-white/45">target {money(target)}</div>
      </div>
      <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-white">
        {money(current)}
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${hit ? "bg-brand-green" : "bg-brand-yellow"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 text-xs font-semibold text-white/45">
        {hit ? "Target smashed 🔥" : `${money(target - current)} to go · ${pct}%`}
      </div>
    </div>
  );
}

function StatTile({
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
    tone === "green"
      ? "before:bg-brand-green"
      : tone === "yellow"
      ? "before:bg-brand-yellow"
      : "before:bg-white/20";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] ${accent}`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
      <div className="mt-1.5 font-display text-2xl font-extrabold tabular-nums text-white">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-white/45">{sub}</div>}
    </div>
  );
}

/* --------------------------------------------------------------------- */

export default async function OpsPage({
  searchParams,
}: {
  searchParams: {
    date?: string;
    saved?: string;
    calok?: string;
    calerr?: string;
    adok?: string;
    aderr?: string;
  };
}) {
  if (!isAuthed()) redirect("/ops/login");

  const today = cairnsToday();
  const date = (searchParams?.date || today).slice(0, 10);
  const isToday = date === today;
  const saved = searchParams?.saved === "1";
  const dateLabel = new Date(`${date}T00:00:00+10:00`).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Brisbane",
  });

  let entry: DailyLog | null = null;
  let recent: DailyLog[] = [];
  let dbError = false;
  try {
    entry = await getDailyLog(date);
    recent = await getRecentLogs(30);
  } catch {
    dbError = true;
  }

  const crewInitial: Record<string, { start?: string; end?: string; notes?: string }> = {};
  for (const name of OPS_STAFF) {
    crewInitial[name] = {
      start: entry?.staff_shifts?.[name]?.start,
      end: entry?.staff_shifts?.[name]?.end,
      notes: entry?.staff_notes?.[name],
    };
  }

  const rev = entry?.revenue_collected ?? 0;
  const status = revenueStatus(rev);
  const { breakEvenRevenue, aimRevenue, jobsTarget, weeklyTarget, monthlyTarget } = OPS_TARGETS;
  const aimPct = Math.min(100, Math.round((rev / aimRevenue) * 100));
  const bePct = Math.min(100, Math.round((breakEvenRevenue / aimRevenue) * 100));

  // week & month pace (from the loaded history)
  const monthKey = today.slice(0, 7);
  const wt = new Date(`${today}T12:00:00+10:00`);
  const dow = (wt.getUTCDay() + 6) % 7; // 0 = Monday
  const weekStart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Brisbane",
  }).format(new Date(wt.getTime() - dow * 86400000));
  const weekRevenue = recent
    .filter((r) => r.log_date >= weekStart && r.log_date <= today)
    .reduce((a, r) => a + r.revenue_collected, 0);
  const monthRevenue = recent
    .filter((r) => r.log_date.startsWith(monthKey))
    .reduce((a, r) => a + r.revenue_collected, 0);

  // ── bookings (from the uploaded calendar) ──
  const from60 = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(
    new Date(Date.now() - 60 * 86400000)
  );
  const d14 = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(
    new Date(Date.now() - 13 * 86400000)
  );
  let bookings: Booking[] = [];
  try {
    bookings = await getRecentBookings(from60);
  } catch {
    /* dbError already surfaced above */
  }
  const last14 = bookings.filter((b) => b.booking_date >= d14 && b.booking_date <= today);
  const corr14 = last14.filter((b) => b.is_correction).length;
  const corrPerDay = corr14 / 10; // ~10 working days in 14
  const weekBookings = bookings.filter((b) => b.booking_date >= weekStart && b.booking_date <= today);
  const weekBookedValue = weekBookings.reduce((a, b) => a + b.value, 0);
  const weekBookedCorr = weekBookings.filter((b) => b.is_correction).length;
  const pipeline = bookings.filter((b) => b.booking_date > today);
  const pipelineValue = pipeline.reduce((a, b) => a + b.value, 0);
  const pipelineCorr = pipeline.filter((b) => b.is_correction).length;

  // CAC this week = week ad spend / week bookings
  const weekAdSpend = recent
    .filter((r) => r.log_date >= weekStart && r.log_date <= today)
    .reduce((a, r) => a + (r.ad_spend || 0), 0);
  const weekCAC = weekBookings.length ? weekAdSpend / weekBookings.length : 0;
  const hasBookings = bookings.length > 0;
  const calCount = searchParams?.calok;
  const calErr = searchParams?.calerr;

  // ── ads (from the uploaded Meta CSV) ──
  let ads: AdRow[] = [];
  try {
    ads = await getAds();
  } catch {
    /* dbError already surfaced */
  }
  const adSpend = ads.reduce((a, r) => a + r.spend, 0);
  const adMessages = ads.reduce((a, r) => a + r.messages, 0);
  const adPurchases = ads.reduce((a, r) => a + r.purchases, 0);
  const adCostPerMsg = adMessages ? adSpend / adMessages : 0;
  const hasAds = ads.length > 0;
  const adOk = searchParams?.adok;
  const adErr = searchParams?.aderr;

  // ── funnel (this week) ──
  const inWeek = (r: DailyLog) => r.log_date >= weekStart && r.log_date <= today;
  const weekLoggedDays = recent.filter(inWeek).length;
  const weekQuotes = recent.filter(inWeek).reduce((a, r) => a + (r.quotes || 0), 0);
  const weekCompleted = recent.filter(inWeek).reduce((a, r) => a + (r.jobs_completed || 0), 0);
  const weekRedos = recent.filter(inWeek).reduce((a, r) => a + (r.redos || 0), 0);
  const quoteClose = weekQuotes ? Math.round((weekBookings.length / weekQuotes) * 100) : 0;

  // ── profit vs break-even ──
  const daysElapsed = dow + 1; // Mon..today
  const weekProfit = weekRevenue - breakEvenRevenue * daysElapsed;

  // ── trend: last full week for context ──
  const prevWeekStart = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(
    new Date(wt.getTime() - (dow + 7) * 86400000)
  );
  const prevWeekEnd = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(
    new Date(wt.getTime() - (dow + 1) * 86400000)
  );
  const prevWeekRevenue = recent
    .filter((r) => r.log_date >= prevWeekStart && r.log_date <= prevWeekEnd)
    .reduce((a, r) => a + r.revenue_collected, 0);

  // ── did we log today / missing days ──
  const loggedDates = new Set(recent.map((r) => r.log_date));
  const loggedToday = loggedDates.has(today);
  const missingLast7: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(
      new Date(wt.getTime() - i * 86400000)
    );
    if (!loggedDates.has(d)) missingLast7.push(d);
  }

  // ── alerts engine ──
  const alerts: { tone: "red" | "yellow"; text: string }[] = [];
  if (!loggedToday)
    alerts.push({ tone: "yellow", text: "Today isn't logged yet — fill in the day before you knock off." });
  if ((entry?.unhappy_customers ?? 0) > 0)
    alerts.push({
      tone: "red",
      text: `${entry?.unhappy_customers} unhappy customer(s) today — follow up before it becomes a review.`,
    });
  if (hasBookings && pipelineCorr === 0)
    alerts.push({ tone: "red", text: "No corrections booked ahead — push the correction ad or call warm leads." });
  if (hasBookings && corrPerDay < 1)
    alerts.push({
      tone: "yellow",
      text: `Corrections running ${corrPerDay.toFixed(1)}/day — below the ~1/day break-even line.`,
    });
  if (weekRedos > 4)
    alerts.push({ tone: "red", text: `${weekRedos} re-dos this week — over the target of 4. Check the crew's quality.` });
  if (weekLoggedDays > 0 && daysElapsed >= 3 && weekProfit < 0)
    alerts.push({
      tone: "yellow",
      text: `Behind break-even this week by ${money(-weekProfit)} — get more jobs out the door.`,
    });
  if (weekBookings.length > 0 && weekCAC > 300)
    alerts.push({ tone: "yellow", text: `CAC is ${money(weekCAC)} this week — refresh the ad creative if it keeps climbing.` });

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      {/* ── header ───────────────────────────────────────────────── */}
      <Reveal>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={EYEBROW}>Smiths Detailing · Cairns</div>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-5xl">
              Daily <span className="text-brand-green">Ops</span>
            </h1>
            <p className="mt-3 text-sm font-semibold text-white/50">
              {dateLabel}
              {isToday && <span className="ml-2 text-brand-green">· Today</span>}
            </p>
          </div>
          <form action={logout}>
            <button className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/60 transition hover:border-white/35 hover:text-white">
              Log out
            </button>
          </form>
        </div>
      </Reveal>

      {!isToday && (
        <div className="mt-4">
          <Link
            href="/ops"
            className="inline-flex rounded-full border border-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/60 transition hover:text-white"
          >
            ← Back to today
          </Link>
        </div>
      )}

      {saved && (
        <div className="mt-5 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-3 text-sm font-semibold text-brand-green">
          Saved ✓ {entry?.updated_at && `· ${entry.updated_at.replace("T", " ")}`}
        </div>
      )}

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          <b className="font-bold">Database not connected.</b> Create a Vercel
          Postgres (Neon) database, connect it to this project, clear any old
          Supabase <code>POSTGRES_*</code> variables, and redeploy — then saving
          and history switch on. Your login is working fine.
        </div>
      )}

      {calCount && (
        <div className="mt-5 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-3 text-sm font-semibold text-brand-green">
          Calendar synced ✓ · {calCount} bookings loaded
        </div>
      )}
      {calErr && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          {calErr === "noics"
            ? "Couldn't find the Smiths Bookings calendar in that file — upload the calendar .zip Google gives you."
            : "No file received — pick the calendar .zip and try again."}
        </div>
      )}
      {adOk && (
        <div className="mt-5 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-3 text-sm font-semibold text-brand-green">
          Ads synced ✓ · {adOk} ads loaded
        </div>
      )}
      {adErr && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          {adErr === "noads"
            ? "Couldn't read any ads in that file — upload the Meta Ads CSV export."
            : "No file received — pick the ads CSV and try again."}
        </div>
      )}

      {/* ── ALERTS ───────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <Reveal delay={40}>
          <section className="mt-6 flex flex-col gap-2">
            <div className={EYEBROW}>Fix these today</div>
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 rounded-xl border px-4 py-2.5 text-sm ${
                  a.tone === "red"
                    ? "border-red-500/40 bg-red-500/[0.08] text-red-300"
                    : "border-brand-yellow/40 bg-brand-yellow/[0.07] text-brand-yellow"
                }`}
              >
                <span aria-hidden>{a.tone === "red" ? "🔴" : "🟡"}</span>
                <span>{a.text}</span>
              </div>
            ))}
          </section>
        </Reveal>
      )}

      {/* ── SCOREBOARD (hero) ────────────────────────────────────── */}
      <Reveal delay={80}>
        <section className="relative mt-7">
          {status.tone !== "neutral" && (
            <div
              className={`pointer-events-none absolute -inset-6 ${
                status.tone === "green" ? "halo-green" : "halo-yellow"
              }`}
              aria-hidden
            />
          )}

          <div
            className={`relative rounded-3xl border p-6 sm:p-7 ${
              status.tone === "green"
                ? "border-brand-green/40 bg-brand-green/[0.05]"
                : status.tone === "yellow"
                ? "border-brand-yellow/40 bg-brand-yellow/[0.05]"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={EYEBROW}>Today&apos;s takings</div>
              <div
                className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                  status.tone === "yellow"
                    ? "bg-brand-yellow/15 text-brand-yellow"
                    : status.tone === "green"
                    ? "bg-brand-green/15 text-brand-green"
                    : "bg-white/5 text-white/40"
                }`}
              >
                {status.label}
              </div>
            </div>

            <div className="mt-3 font-display text-6xl font-extrabold leading-none tabular-nums text-white sm:text-7xl">
              {money(rev)}
            </div>

            {/* progress toward the aim, with the break-even marker */}
            <div className="relative mt-6 h-3.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all ${
                  rev >= breakEvenRevenue ? "bg-brand-green" : "bg-brand-yellow"
                }`}
                style={{ width: `${aimPct}%` }}
              />
              <div
                className="absolute top-[-2px] h-[calc(100%+4px)] w-0.5 bg-white"
                style={{ left: `${bePct}%` }}
                aria-hidden
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-bold text-white/45">
              <span>Break-even {money(breakEvenRevenue)}</span>
              <span>Aim {money(aimRevenue)}</span>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={140}>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Jobs done"
            value={String(entry?.jobs_completed ?? 0)}
            sub={`aim ${jobsTarget}/day`}
            tone={(entry?.jobs_completed ?? 0) >= jobsTarget ? "green" : "neutral"}
          />
          <StatTile
            label="Completed"
            value={money(entry?.completed_revenue ?? 0)}
            sub="work done today"
          />
          <StatTile
            label="Happy"
            value={String(entry?.happy_customers ?? 0)}
            tone={(entry?.happy_customers ?? 0) > 0 ? "green" : "neutral"}
          />
          <StatTile
            label="Unhappy"
            value={String(entry?.unhappy_customers ?? 0)}
            tone={(entry?.unhappy_customers ?? 0) > 0 ? "yellow" : "neutral"}
          />
        </div>
      </Reveal>

      {/* ── WEEK & MONTH PACE ────────────────────────────────────── */}
      <Reveal delay={200}>
        <section className="mt-8">
          <SectionTitle eyebrow="The targets" title="Week &amp; month pace" />
          <div className="grid gap-3 sm:grid-cols-2">
            <PaceCard label="This week" current={weekRevenue} target={weeklyTarget} />
            <PaceCard label="This month" current={monthRevenue} target={monthlyTarget} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
            <span className="text-white/50">
              Week profit vs break-even{" "}
              <span className="text-white/30">({daysElapsed}d in)</span>
            </span>
            {weekLoggedDays === 0 ? (
              <span className="text-sm font-semibold text-white/40">— start logging</span>
            ) : (
              <span
                className={`font-display text-lg font-extrabold tabular-nums ${
                  weekProfit >= 0 ? "text-brand-green" : "text-brand-yellow"
                }`}
              >
                {weekProfit >= 0 ? "+" : ""}
                {money(weekProfit)}
              </span>
            )}
          </div>
          {prevWeekRevenue > 0 && (
            <div className="mt-1 text-xs text-white/35">
              Last full week collected {money(prevWeekRevenue)}.
            </div>
          )}
        </section>
      </Reveal>

      {/* ── BOOKINGS & ADS (from calendar) ───────────────────────── */}
      <Reveal delay={240}>
        <section className="mt-8">
          <SectionTitle eyebrow="From your calendar" title="Bookings &amp; ads" />

          {hasBookings ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile
                label="Corrections/day"
                value={corrPerDay.toFixed(1)}
                sub={`aim ${jobsTarget}/day · ${corr14} in 14d`}
                tone={corrPerDay >= 1 ? "green" : corrPerDay > 0 ? "yellow" : "neutral"}
              />
              <StatTile
                label="Booked this week"
                value={String(weekBookings.length)}
                sub={`${money(weekBookedValue)} · ${weekBookedCorr} corr`}
              />
              <StatTile
                label="Pipeline ahead"
                value={String(pipeline.length)}
                sub={`${money(pipelineValue)} · ${pipelineCorr} corr`}
                tone={pipeline.length > 0 ? "green" : "yellow"}
              />
              <StatTile
                label="CAC this week"
                value={weekCAC ? money(weekCAC) : "—"}
                sub={`${money(weekAdSpend)} ad spend`}
              />
            </div>
          ) : (
            <p className="text-sm text-white/45">
              No bookings loaded yet — upload your calendar below to switch this on.
            </p>
          )}

          <form
            action={uploadCalendar}
            className={`mt-3 ${CARD} flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between`}
          >
            <div>
              <div className="text-sm font-bold text-white">Sync bookings</div>
              <div className="mt-0.5 text-xs text-white/45">
                Drop in the Google Calendar export (.zip or .ics) — refreshes corrections/day &amp;
                pipeline.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                name="cal"
                accept=".zip,.ics"
                required
                className="max-w-[190px] text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/20"
              />
              <button className="shrink-0 rounded-full bg-brand-green px-5 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
                Upload
              </button>
            </div>
          </form>
        </section>
      </Reveal>

      {/* ── AD PERFORMANCE (from Meta CSV) ───────────────────────── */}
      <Reveal delay={260}>
        <section className="mt-8">
          <SectionTitle eyebrow="From Meta" title="Ad performance" />

          {hasAds ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Ad spend" value={money(adSpend)} sub="this export" />
                <StatTile
                  label="Messages"
                  value={String(adMessages)}
                  sub="conversations"
                  tone={adMessages > 0 ? "green" : "neutral"}
                />
                <StatTile
                  label="Cost / message"
                  value={adCostPerMsg ? money(adCostPerMsg) : "—"}
                  sub="lower is better"
                />
                <StatTile label="Purchases" value={String(adPurchases)} sub="Meta-attributed" />
              </div>

              <div className={`mt-3 overflow-x-auto ${CARD}`}>
                <table className="w-full border-collapse text-sm tabular-nums">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Ad", "Spend", "Msgs", "$/msg", "Buys"].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-white/40"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map((a, i) => (
                      <tr key={i} className="border-b border-white/[0.06] last:border-0">
                        <td className="max-w-[150px] truncate px-3 py-2.5 font-semibold text-white/85">
                          {a.name}
                        </td>
                        <td className="px-3 py-2.5 text-white/70">{money(a.spend)}</td>
                        <td className="px-3 py-2.5 text-white/70">{a.messages}</td>
                        <td className="px-3 py-2.5 font-bold text-brand-green">
                          {a.cost_per_message ? money(a.cost_per_message) : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-white/70">{a.purchases}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-white/45">
              No ads loaded yet — upload the Meta Ads CSV below.
            </p>
          )}

          <form
            action={uploadAds}
            className={`mt-3 ${CARD} flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between`}
          >
            <div>
              <div className="text-sm font-bold text-white">Sync ad stats</div>
              <div className="mt-0.5 text-xs text-white/45">
                Drop in the Meta Ads CSV — captures spend, messages, cost-per-message &amp; purchases
                per ad.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                name="ads"
                accept=".csv"
                required
                className="max-w-[190px] text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/20"
              />
              <button className="shrink-0 rounded-full bg-brand-green px-5 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
                Upload
              </button>
            </div>
          </form>
        </section>
      </Reveal>

      {/* ── FUNNEL (this week) ───────────────────────────────────── */}
      <Reveal delay={280}>
        <section className="mt-8">
          <SectionTitle eyebrow="This week" title="The funnel" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Leads (msgs)" value={String(adMessages)} sub="from Meta" />
            <StatTile label="Quotes sent" value={String(weekQuotes)} sub="logged this week" />
            <StatTile
              label="Booked"
              value={String(weekBookings.length)}
              sub={weekQuotes ? `${quoteClose}% of quotes` : "log quotes to see %"}
              tone={weekQuotes && quoteClose >= 40 ? "green" : weekQuotes ? "yellow" : "neutral"}
            />
            <StatTile label="Completed" value={String(weekCompleted)} sub="jobs done" />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            Leads → quotes → booked → completed. High leads but low bookings = the leak is your
            close rate; check response time and the pitch.
          </p>
        </section>
      </Reveal>

      {/* ── ENTRY FORM ───────────────────────────────────────────── */}
      <form action={saveEntry}>
        {/* the numbers */}
        <section className={`mt-10 ${CARD} p-6`}>
          <SectionTitle
            eyebrow={entry ? "Update the log" : "Log the day"}
            title="The numbers"
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              Date
            </span>
            <input
              type="date"
              name="log_date"
              defaultValue={date}
              className={`${FIELD} px-3 py-3 sm:w-auto`}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <NumField
              label="Jobs completed"
              name="jobs_completed"
              defaultValue={entry?.jobs_completed ?? ""}
            />
            <NumField
              label="Revenue collected"
              name="revenue_collected"
              prefix="$"
              step={0.01}
              defaultValue={entry?.revenue_collected ?? ""}
            />
            <NumField
              label="Completed revenue (est)"
              name="completed_revenue"
              prefix="$"
              step={0.01}
              defaultValue={entry?.completed_revenue ?? ""}
            />
            <NumField
              label="Ad spend today"
              name="ad_spend"
              prefix="$"
              step={0.01}
              defaultValue={entry?.ad_spend ?? ""}
            />
            <NumField
              label="Quotes sent"
              name="quotes"
              defaultValue={entry?.quotes ?? ""}
            />
            <NumField label="Re-dos" name="redos" defaultValue={entry?.redos ?? ""} />
            <NumField
              label="Happy customers"
              name="happy_customers"
              defaultValue={entry?.happy_customers ?? ""}
            />
            <NumField
              label="Unhappy customers"
              name="unhappy_customers"
              defaultValue={entry?.unhappy_customers ?? ""}
            />
          </div>
        </section>

        {/* the crew */}
        <section className="mt-8">
          <SectionTitle eyebrow="Who was on" title="The crew" />
          <StaffHours staff={OPS_STAFF} initial={crewInitial} />
        </section>

        {/* the day */}
        <section className={`mt-8 ${CARD} p-6`}>
          <SectionTitle eyebrow="The story" title="How the day went" />
          <textarea
            name="notes_today"
            rows={4}
            defaultValue={entry?.notes_today ?? ""}
            placeholder="Wins, hold-ups, anything you want me to see — the good and the bad."
            className={`${FIELD} px-3 py-3`}
          />

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-brand-green px-6 py-4 text-sm font-black text-[#04130a] shadow-[0_10px_40px_rgba(43,255,122,0.25)] transition hover:brightness-110 active:scale-95 sm:w-auto sm:px-14"
          >
            Save the day →
          </button>
        </section>
      </form>

      {/* ── HISTORY ──────────────────────────────────────────────── */}
      <Reveal>
        <section className="mt-14">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <div className={EYEBROW}>The record</div>
              <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-white">
                Last 30 days
              </h2>
            </div>
            <a
              href="/ops/export"
              className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/60 transition hover:border-white/35 hover:text-white"
            >
              Export CSV ↓
            </a>
          </div>

          {missingLast7.length > 0 && (
            <div className="mb-3 rounded-xl border border-brand-yellow/30 bg-brand-yellow/[0.05] px-4 py-2.5 text-xs text-brand-yellow">
              Missing logs in the last 7 days: {missingLast7.join(", ")} — fill the gaps so the
              numbers stay honest.
            </div>
          )}

          {recent.length === 0 ? (
            <p className="text-sm text-white/45">
              No days logged yet — your first entry will show here.
            </p>
          ) : (
            <div className={`overflow-x-auto ${CARD}`}>
              <table className="w-full border-collapse text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Date", "Collected", "Compl", "Done", "🙂", "🙁", "Hrs"].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-white/40"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => {
                    const ok = r.revenue_collected >= breakEvenRevenue;
                    return (
                      <tr
                        key={r.log_date}
                        className="border-b border-white/[0.06] transition last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="whitespace-nowrap px-3 py-3">
                          <Link
                            href={`/ops?date=${r.log_date}`}
                            className="font-semibold text-white/85 underline-offset-4 hover:text-brand-green hover:underline"
                          >
                            {r.log_date}
                          </Link>
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-3 font-black ${
                            ok ? "text-brand-green" : "text-brand-yellow"
                          }`}
                        >
                          {money(r.revenue_collected)}
                        </td>
                        <td className="px-3 py-3 text-white/60">{money(r.completed_revenue)}</td>
                        <td className="px-3 py-3 text-white/70">{r.jobs_completed}</td>
                        <td className="px-3 py-3 text-white/70">{r.happy_customers}</td>
                        <td className="px-3 py-3 text-white/70">{r.unhappy_customers}</td>
                        <td className="px-3 py-3 text-white/70">{totalHours(r)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Reveal>

      <p className="mt-16 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
