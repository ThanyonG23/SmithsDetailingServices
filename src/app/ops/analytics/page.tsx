import type { Metadata } from "next";
import Link from "next/link";
import { requireOwner } from "@/lib/ops/auth";
import {
  getAnalytics,
  getSatisfaction,
  getReorderCount,
  getQuoteLeadStats,
  type AnalyticsDay,
} from "@/lib/ops/db";
import { cairnsToday, OPS_TARGETS } from "@/lib/ops/config";

export const metadata: Metadata = {
  title: "Analytics | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";

const dayLabel = (d: string) =>
  new Date(`${d}T00:00:00+10:00`).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Australia/Brisbane",
  });

const RANGES = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "quarter", label: "3 months" },
  { key: "all", label: "All time" },
];

function shift(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-3 mt-8">
      <div className={EYEBROW}>{eyebrow}</div>
      <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-white">{title}</h2>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "green" | "red";
}) {
  const valColor =
    tone === "green" ? "text-brand-green" : tone === "red" ? "text-red-300" : "text-white";
  return (
    <div className={`${CARD} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{label}</div>
      <div className={`mt-1 font-display text-2xl font-extrabold tabular-nums ${valColor}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-white/45">{sub}</div>}
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  requireOwner();

  const today = cairnsToday();
  const range = RANGES.some((r) => r.key === searchParams?.range) ? searchParams!.range! : "month";

  const anchor = new Date(today + "T00:00:00Z");
  const dow = anchor.getUTCDay(); // 0 Sun .. 6 Sat
  let fromISO: string;
  if (range === "week") {
    fromISO = shift(today, -((dow + 6) % 7)); // Monday of this week
  } else if (range === "quarter") {
    const d = new Date(today + "T00:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - 2, 1);
    fromISO = d.toISOString().slice(0, 10);
  } else if (range === "all") {
    fromISO = "2024-01-01";
  } else {
    fromISO = today.slice(0, 8) + "01"; // 1st of this month
  }
  const toISO = today;

  const { aimRevenue, breakEvenRevenue, weeklyTarget, monthlyTarget } = OPS_TARGETS;

  let series: AnalyticsDay[] = [];
  let satisfaction = { happy: 0, unhappy: 0 };
  let reorders = 0;
  let quoteStats = { total: 0, pending: 0, actioned: 0 };
  let dbError = false;
  try {
    series = await getAnalytics(fromISO, toISO);
    satisfaction = await getSatisfaction(fromISO, toISO);
    reorders = await getReorderCount();
    quoteStats = await getQuoteLeadStats();
  } catch {
    dbError = true;
  }

  // ── aggregates ──
  const sum = (f: (d: AnalyticsDay) => number) => series.reduce((a, d) => a + f(d), 0);
  const totalEarned = sum((d) => d.earned);
  const totalCollected = sum((d) => d.collected);
  const totalBooked = sum((d) => d.booked);
  const totalAdSpend = sum((d) => d.ad_spend);
  const totalLeads = sum((d) => d.leads);
  const totalBookings = sum((d) => d.bookings);
  const totalCorrections = sum((d) => d.corrections);
  const totalCancellations = sum((d) => d.cancellations);
  const totalRedos = sum((d) => d.redos);

  const workedDays = series.filter((d) => d.earned > 0 || d.jobs_completed > 0 || d.bookings > 0);
  const opDays = workedDays.length;
  const avgEarned = opDays ? totalEarned / opDays : 0;
  const daysHitAim = series.filter((d) => d.earned >= aimRevenue).length;
  const best = series.reduce<AnalyticsDay | null>(
    (b, d) => (d.earned > (b?.earned || 0) ? d : b),
    null
  );
  const costPerLead = totalLeads > 0 ? totalAdSpend / totalLeads : 0;
  const costPerBooking = totalBookings > 0 ? totalAdSpend / totalBookings : 0;
  const otherJobs = Math.max(0, totalBookings - totalCorrections);

  // period target (week/month only)
  const periodTarget = range === "week" ? weeklyTarget : range === "month" ? monthlyTarget : 0;
  const periodPct = periodTarget ? Math.min(100, Math.round((totalEarned / periodTarget) * 100)) : 0;

  // chart scaling
  const chartMax = Math.max(aimRevenue, ...series.map((d) => d.earned), 1);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Analy<span className="text-brand-green">tics</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Every number that matters — are we making enough per day to stay ahead.
      </p>

      {/* range toggle */}
      <div className="mt-5 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {RANGES.map((r) => (
          <Link
            key={r.key}
            href={`/ops/analytics?range=${r.key}`}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition ${
              r.key === range
                ? "bg-brand-green text-[#04130a]"
                : "border border-white/15 bg-white/[0.03] text-white/70 hover:text-white"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database didn&apos;t respond — refresh in a moment.
        </div>
      )}

      {/* ── REVENUE (hero) ── */}
      <SectionTitle eyebrow="Money · the number that keeps us alive" title="Revenue" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile
          label="Earned"
          value={money(totalEarned)}
          sub={`${opDays} day${opDays === 1 ? "" : "s"} worked`}
          tone="green"
        />
        <Tile
          label="Avg / day"
          value={money(avgEarned)}
          sub={`aim ${money(aimRevenue)}`}
          tone={avgEarned >= aimRevenue ? "green" : avgEarned >= breakEvenRevenue ? "neutral" : "red"}
        />
        <Tile
          label="Days hit aim"
          value={`${daysHitAim}/${opDays}`}
          sub={`≥ ${money(aimRevenue)} earned`}
        />
        <Tile label="Collected" value={money(totalCollected)} sub="cash actually taken" />
        <Tile label="Booked in" value={money(totalBooked)} sub={`${totalBookings} bookings`} />
        <Tile
          label="Best day"
          value={best && best.earned > 0 ? money(best.earned) : "—"}
          sub={best && best.earned > 0 ? dayLabel(best.date) : "no data yet"}
        />
      </div>

      {periodTarget > 0 && (
        <div className={`${CARD} mt-3 p-4`}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-white">
              {range === "week" ? "This week" : "This month"} vs target
            </span>
            <span className="tabular-nums text-white/60">
              {money(totalEarned)} / {money(periodTarget)}
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${totalEarned >= periodTarget ? "bg-brand-green" : "bg-brand-yellow"}`}
              style={{ width: `${periodPct}%` }}
            />
          </div>
        </div>
      )}

      {/* daily earned bars */}
      {series.length > 0 && (
        <div className={`${CARD} mt-3 p-4`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Earned per day
            </span>
            <span className="text-[10px] font-semibold text-brand-green">
              — aim {money(aimRevenue)}
            </span>
          </div>
          <div className="relative flex h-32 items-end gap-1 overflow-x-auto">
            {/* aim reference line */}
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-brand-green/40"
              style={{ bottom: `${(aimRevenue / chartMax) * 100}%` }}
              aria-hidden
            />
            {series.map((d) => {
              const h = Math.round((d.earned / chartMax) * 100);
              const hit = d.earned >= aimRevenue;
              return (
                <div
                  key={d.date}
                  className="group relative flex min-w-[6px] flex-1 flex-col justify-end"
                  title={`${dayLabel(d.date)} · ${money(d.earned)}`}
                >
                  <div
                    className={`w-full rounded-t ${
                      d.cancellations > 0 && d.earned === 0
                        ? "bg-red-500/50"
                        : hit
                        ? "bg-brand-green"
                        : d.earned > 0
                        ? "bg-brand-green/40"
                        : "bg-white/8"
                    }`}
                    style={{ height: `${Math.max(h, d.earned > 0 ? 3 : 1)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MARKETING & LEADS ── */}
      <SectionTitle eyebrow="Marketing · is the spend paying off" title="Leads & ads" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile label="Ad spend" value={money(totalAdSpend)} sub="this period" tone="red" />
        <Tile label="Leads" value={String(totalLeads)} sub="enquiries logged" />
        <Tile label="Bookings" value={String(totalBookings)} sub="jobs on the calendar" />
        <Tile
          label="Cost / lead"
          value={totalLeads > 0 ? money(costPerLead) : "—"}
          sub="ad spend ÷ leads"
        />
        <Tile
          label="Cost / booking"
          value={totalBookings > 0 ? money(costPerBooking) : "—"}
          sub="ad spend ÷ bookings"
        />
        <Tile
          label="Website quotes"
          value={String(quoteStats.total)}
          sub={`${quoteStats.pending} new · all-time`}
        />
      </div>

      {/* ── JOBS ── */}
      <SectionTitle eyebrow="Operations · how the work flowed" title="Jobs" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Bookings" value={String(totalBookings)} />
        <Tile label="Corrections" value={String(totalCorrections)} sub={`${otherJobs} other`} tone="green" />
        <Tile
          label="No-shows"
          value={String(totalCancellations)}
          tone={totalCancellations > 0 ? "red" : "neutral"}
        />
        <Tile label="Re-dos" value={String(totalRedos)} tone={totalRedos > 0 ? "red" : "neutral"} />
      </div>

      {/* ── CUSTOMERS ── */}
      <SectionTitle eyebrow="Customers · are they happy" title="Satisfaction" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile label="Happy" value={String(satisfaction.happy)} tone="green" />
        <Tile
          label="Not happy"
          value={String(satisfaction.unhappy)}
          tone={satisfaction.unhappy > 0 ? "red" : "neutral"}
        />
        <Tile label="Reorders" value={String(reorders)} sub="repeat customers · all-time" />
      </div>

      <p className="mt-10 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-white/40">
        Labour cost and profit aren&apos;t shown yet — the crew clock and Xero P&amp;L need to be
        clean first so they don&apos;t mislead. They join here once month-2 gives a real P&amp;L.
      </p>

      <p className="mt-8 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Owner only
      </p>
    </main>
  );
}
