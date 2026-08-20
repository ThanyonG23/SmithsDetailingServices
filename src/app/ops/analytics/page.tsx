import type { Metadata } from "next";
import Link from "next/link";
import { requireOwner } from "@/lib/ops/auth";
import {
  getAnalytics,
  getSatisfaction,
  getReorderCount,
  getQuoteLeadStats,
  getLeadAnalytics,
  getSalesStats,
  getLeadSaleMatch,
  type AnalyticsDay,
  type LeadAnalytics,
  type SalesStats,
  type LeadSaleMatch,
} from "@/lib/ops/db";
import { cairnsToday, OPS_TARGETS, adLabel } from "@/lib/ops/config";

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
  let leads: LeadAnalytics | null = null;
  let sales: SalesStats | null = null;
  let saleMatch: LeadSaleMatch | null = null;
  let dbError = false;
  try {
    series = await getAnalytics(fromISO, toISO);
    satisfaction = await getSatisfaction(fromISO, toISO);
    reorders = await getReorderCount();
    quoteStats = await getQuoteLeadStats();
    leads = await getLeadAnalytics(fromISO, toISO, today);
    sales = await getSalesStats(fromISO, toISO);
    saleMatch = await getLeadSaleMatch();
  } catch {
    dbError = true;
  }
  const salesMonthMax = sales ? Math.max(...sales.monthly.map((m) => m.revenue), 1) : 1;

  const fuMax = leads
    ? Math.max(leads.intake, leads.qualified, leads.fu1, leads.fu2, leads.fu3, leads.converted, 1)
    : 1;
  const leadWeekMax = leads ? Math.max(...leads.weekly.map((w) => w.leads), 1) : 1;

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
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
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

      {/* ── REAL REVENUE (from Xero) ── */}
      {sales && sales.allTimeInvoices > 0 && (
        <>
          <SectionTitle eyebrow="Real money · from your Xero invoices" title="Actual revenue" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile label="Revenue (real)" value={money(sales.revenue)} sub={`${sales.invoices} invoices`} tone="green" />
            <Tile label="Avg invoice" value={sales.invoices ? money(sales.avg) : "—"} sub="incl. upsells" />
            <Tile label="All-time loaded" value={money(sales.allTimeRevenue)} sub={`${sales.allTimeInvoices} invoices`} />
            <Tile
              label="Per day"
              value={sales.invoices ? money(sales.revenue / Math.max(1, opDays)) : "—"}
              sub={`aim ${money(aimRevenue)}`}
              tone={sales.revenue / Math.max(1, opDays) >= aimRevenue ? "green" : "neutral"}
            />
          </div>
          {sales.monthly.length > 0 && (
            <div className={`${CARD} mt-3 p-4`}>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Real revenue by month</div>
              <div className="flex flex-col gap-2">
                {sales.monthly.slice(-12).map((m) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs font-semibold text-white/55">{m.month}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-brand-green" style={{ width: `${Math.max(3, Math.round((m.revenue / salesMonthMax) * 100))}%` }} />
                    </div>
                    <span className="w-20 shrink-0 text-right text-xs font-bold tabular-nums text-white/70">{money(m.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sales.byService.length > 0 && (
            <div className={`${CARD} mt-3 overflow-hidden`}>
              <div className="border-b border-white/8 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                Revenue by service (real)
              </div>
              {sales.byService.map((s) => (
                <div key={s.service} className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5 last:border-0">
                  <span className="text-sm font-semibold text-white/85">{s.service}</span>
                  <span className="shrink-0 text-xs tabular-nums text-white/55">
                    {s.count} job{s.count === 1 ? "" : "s"} · <b className="text-brand-green">{money(s.revenue)}</b>
                  </span>
                </div>
              ))}
            </div>
          )}
          {saleMatch && saleMatch.matchedLeads > 0 && (
            <div className={`${CARD} mt-3 p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                Leads → confirmed paid (matched to a Xero invoice)
              </div>
              <div className="mt-1.5 text-sm text-white/70">
                <b className="text-brand-green">{saleMatch.matchedLeads}</b> of {saleMatch.realLeads} real leads are matched to a real invoice
                {" "}(<b className="text-brand-green">{saleMatch.matchRate}%</b>) worth{" "}
                <b className="text-brand-green">{money(saleMatch.matchedRevenue)}</b>.
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">
                This is a <b className="text-white/60">floor</b>, not the exact rate — your Messenger leads carry no email, so this
                matches on name only and under-counts (nicknames, business names, different spelling). Treat it as &ldquo;at least this
                many provably paid.&rdquo;
              </p>
              {saleMatch.byAd.length > 0 && (
                <div className="mt-3 border-t border-white/8 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Real revenue by ad (matched)</div>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {saleMatch.byAd.map((a) => (
                      <div key={a.ad_id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="min-w-0 flex-1 truncate font-semibold text-white/80">{adLabel(a.ad_id)}</span>
                        <span className="shrink-0 tabular-nums text-white/55">
                          {a.matched}/{a.leads} paid · <b className="text-brand-green">{money(a.revenue)}</b>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="mt-2 text-[11px] text-white/35">
            This is real invoiced money from Xero — the section below (&ldquo;Revenue&rdquo;) is the estimate you log day-to-day.
          </p>
        </>
      )}

      {/* ── REVENUE (hero) ── */}
      <SectionTitle eyebrow="Money · what you log (estimate)" title="Revenue" />
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

      {/* ── LEAD CENTRE (funnel · follow-ups · conversion) ── */}
      {leads && leads.total > 0 && (
        <>
          <SectionTitle eyebrow="From your Leads Centre uploads" title="Lead pipeline" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile label="Real leads" value={String(leads.real)} sub={`${leads.total} incl. ${leads.abused} junk`} />
            <Tile label="Converted" value={String(leads.converted)} sub={`${leads.convertedInPeriod} this period`} tone="green" />
            <Tile
              label="Conversion rate"
              value={`${leads.conversionRate}%`}
              sub="of real leads"
              tone={leads.conversionRate >= 30 ? "green" : "neutral"}
            />
            <Tile label="In follow-up" value={String(leads.followUp)} sub="not yet won or lost" />
          </div>

          {/* funnel — where every lead sits right now */}
          <div className={`${CARD} mt-3 p-4`}>
            <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Where every lead sits right now
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Intake", n: leads.intake },
                { label: "Qualified", n: leads.qualified },
                { label: "1st follow-up", n: leads.fu1 },
                { label: "2nd follow-up", n: leads.fu2 },
                { label: "3rd follow-up", n: leads.fu3 },
                { label: "Converted", n: leads.converted, green: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs font-semibold text-white/60">{s.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${s.green ? "bg-brand-green" : "bg-brand-green/40"}`}
                      style={{ width: `${s.n ? Math.max(3, Math.round((s.n / fuMax) * 100)) : 0}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-white/70">{s.n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* follow-up backlog aged — which to chase, which are dead */}
          <div className="mb-1 mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
            Follow-up backlog · by age
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile label="Fresh · ≤7 days" value={String(leads.fuFresh)} sub="chase now — hottest" tone={leads.fuFresh > 0 ? "green" : "neutral"} />
            <Tile label="Warm · 8–21 days" value={String(leads.fuWarm)} sub="still workable" />
            <Tile label="Stale · 22–60 days" value={String(leads.fuStale)} sub="last-ditch effort" />
            <Tile label="Cold · 60+ days" value={String(leads.fuCold)} sub="likely dead — mark abused" tone={leads.fuCold > 0 ? "red" : "neutral"} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            Work the <b className="text-white/60">fresh</b> pile first — those convert fastest. The{" "}
            <b className="text-white/60">cold</b> pile is why the raw follow-up number looks huge; mark
            those Abused in the Leads Centre so the real backlog reads true.
          </p>

          {/* weekly lead volume */}
          {leads.weekly.length > 0 && (
            <div className={`${CARD} mt-4 p-4`}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Leads per week</span>
                <span className="text-[10px] font-semibold text-brand-green">green = converted</span>
              </div>
              <div className="flex h-28 items-end gap-1 overflow-x-auto">
                {leads.weekly.map((w) => {
                  const h = Math.round((w.leads / leadWeekMax) * 100);
                  const cph = w.leads ? Math.round((w.converted / w.leads) * 100) : 0;
                  return (
                    <div
                      key={w.week}
                      className="group relative flex min-w-[8px] flex-1 flex-col justify-end"
                      title={`${w.week} · ${w.leads} leads · ${w.converted} converted`}
                    >
                      <div className="relative w-full rounded-t bg-white/12" style={{ height: `${Math.max(h, w.leads ? 3 : 1)}%` }}>
                        <div className="absolute bottom-0 w-full rounded-t bg-brand-green" style={{ height: `${cph}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* attribution — which ads / sources bring leads that convert */}
          {leads.byAd.length > 0 && (
            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              <div className={`${CARD} overflow-hidden`}>
                <div className="border-b border-white/8 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  Ads that convert
                </div>
                {leads.byAd.map((a) => (
                  <div key={a.ad_id} className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5 last:border-0">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/85">{adLabel(a.ad_id)}</span>
                    <span className="shrink-0 text-xs tabular-nums text-white/55">
                      {a.leads} lead{a.leads === 1 ? "" : "s"} · <b className="text-brand-green">{a.converted} won</b> · {a.rate}%
                    </span>
                  </div>
                ))}
              </div>
              {leads.bySource.length > 0 && (
                <div className={`${CARD} overflow-hidden`}>
                  <div className="border-b border-white/8 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    By source
                  </div>
                  {leads.bySource.map((s) => (
                    <div key={s.source} className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5 last:border-0">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/85">{s.source}</span>
                      <span className="shrink-0 text-xs tabular-nums text-white/55">
                        {s.leads} lead{s.leads === 1 ? "" : "s"} · <b className="text-brand-green">{s.converted} won</b>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="mt-3 text-[11px] text-white/35">
            From your last Leads Centre upload{leads.loadedAt ? ` · ${leads.loadedAt}` : ""}. Conversion
            counts leads by the date they came in, so it climbs as this period&apos;s leads get worked.
          </p>
        </>
      )}

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
