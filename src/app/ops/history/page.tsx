import type { Metadata } from "next";
import { requireOwner } from "@/lib/ops/auth";
import {
  getRecentLogs,
  getGrowthSeries,
  type DailyLog,
  type GrowthDay,
} from "@/lib/ops/db";
import { cairnsToday } from "@/lib/ops/config";

export const metadata: Metadata = {
  title: "History | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const brisFmt = (ms: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(new Date(ms));

function mondayOf(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00+10:00`);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = Monday
  return brisFmt(d.getTime() - dow * 86400000);
}
function weekdayIdx(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00+10:00`);
  return (d.getUTCDay() + 6) % 7; // 0 = Monday
}
const pct = (now: number, prev: number) =>
  prev > 0 ? Math.round(((now - prev) / prev) * 100) : now > 0 ? 100 : 0;

function dayHours(sh: Record<string, number> | undefined): number {
  if (!sh || typeof sh !== "object") return 0;
  return Math.round(Object.values(sh).reduce((a, b) => a + (Number(b) || 0), 0) * 100) / 100;
}
function isDayLogged(r: DailyLog): boolean {
  return (
    (r.completed_revenue || 0) > 0 ||
    (r.revenue_collected || 0) > 0 ||
    (r.jobs_completed || 0) > 0 ||
    (r.ad_spend || 0) > 0 ||
    (r.quotes || 0) > 0 ||
    (r.messages || 0) > 0 ||
    (r.redos || 0) > 0 ||
    (r.notes_today || "").trim().length > 0 ||
    Object.keys(r.staff_hours || {}).length > 0
  );
}

type Week = {
  week: string;
  rev: number;
  redos: number;
  jobs: number;
  days: number;
  leads: number;
  bookings: number;
  corr: number;
};

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  requireOwner();

  const today = cairnsToday();
  const from = brisFmt(Date.now() - 120 * 86400000);

  let recent: DailyLog[] = [];
  let growth: GrowthDay[] = [];
  let dbError = false;
  try {
    const data = await Promise.race([
      (async () => ({
        recent: await getRecentLogs(120),
        growth: await getGrowthSeries(from, today),
      }))(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 20000)),
    ]);
    ({ recent, growth } = data);
  } catch {
    dbError = true;
  }

  // ── weekly buckets ──
  const wk = new Map<string, Week>();
  const blank = (week: string): Week => ({
    week,
    rev: 0,
    redos: 0,
    jobs: 0,
    days: 0,
    leads: 0,
    bookings: 0,
    corr: 0,
  });
  for (const r of recent) {
    const w = mondayOf(r.log_date);
    const e = wk.get(w) || blank(w);
    e.rev += r.completed_revenue || 0; // earned — matches the dashboard's profitability gauge
    e.redos += r.redos || 0;
    e.jobs += r.jobs_completed || 0;
    e.days += 1;
    wk.set(w, e);
  }
  for (const g of growth) {
    const w = mondayOf(g.date);
    const e = wk.get(w) || blank(w);
    e.leads += g.messages + g.messages_meta;
    e.bookings += g.new_bookings;
    e.corr += g.new_corrections;
    wk.set(w, e);
  }
  const weeks = [...wk.values()].sort((a, b) => b.week.localeCompare(a.week)).slice(0, 10);

  // ── month comparison ──
  const monthKey = today.slice(0, 7);
  const [yy, mm] = monthKey.split("-").map(Number);
  const lastKey = mm === 1 ? `${yy - 1}-12` : `${yy}-${String(mm - 1).padStart(2, "0")}`;
  const monthAgg = (key: string) => {
    const days = recent.filter((r) => r.log_date.startsWith(key));
    const gs = growth.filter((g) => g.date.startsWith(key));
    const rev = days.reduce((a, r) => a + (r.completed_revenue || 0), 0);
    const redos = days.reduce((a, r) => a + (r.redos || 0), 0);
    const leads = gs.reduce((a, g) => a + g.messages + g.messages_meta, 0);
    const bookings = gs.reduce((a, g) => a + g.new_bookings, 0);
    const corr = gs.reduce((a, g) => a + g.new_corrections, 0);
    return { rev, redos, leads, bookings, corr, conv: leads ? Math.round((bookings / leads) * 100) : 0 };
  };
  const tm = monthAgg(monthKey);
  const lm = monthAgg(lastKey);

  // ── best weekday (avg revenue) ──
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const wd = names.map(() => ({ rev: 0, n: 0 }));
  for (const r of recent) {
    const i = weekdayIdx(r.log_date);
    wd[i].rev += r.completed_revenue || 0;
    wd[i].n += 1;
  }
  const wdRows = names.map((name, i) => ({ name, avg: wd[i].n ? wd[i].rev / wd[i].n : 0, n: wd[i].n }));
  const maxWdAvg = Math.max(1, ...wdRows.map((w) => w.avg));
  const bestDay = [...wdRows].filter((w) => w.n > 0).sort((a, b) => b.avg - a.avg)[0];

  // ── auto insights ──
  const insights: { tone: "green" | "yellow"; text: string }[] = [];
  if (lm.rev > 0) {
    const c = pct(tm.rev, lm.rev);
    insights.push({
      tone: c >= 0 ? "green" : "yellow",
      text: `Revenue ${c >= 0 ? "up" : "down"} ${Math.abs(c)}% vs last month (${money(tm.rev)} vs ${money(lm.rev)}).`,
    });
  }
  if (tm.leads > 0) {
    insights.push({
      tone: tm.conv >= 15 ? "green" : "yellow",
      text: `Conversion ${tm.conv}% this month — ${tm.bookings} booked from ${tm.leads} leads.`,
    });
  }
  if (lm.corr > 0) {
    const c = pct(tm.corr, lm.corr);
    insights.push({
      tone: c >= 0 ? "green" : "yellow",
      text: `Corrections ${c >= 0 ? "up" : "down"} ${Math.abs(c)}% vs last month (${tm.corr} vs ${lm.corr}).`,
    });
  }
  if (bestDay) {
    insights.push({ tone: "green", text: `Best day: ${bestDay.name} averages ${money(bestDay.avg)}.` });
  }
  if (tm.redos > 0) {
    insights.push({
      tone: tm.redos > 8 ? "yellow" : "green",
      text: `${tm.redos} re-do${tm.redos === 1 ? "" : "s"} this month${tm.redos > 8 ? " — watch quality" : " — quality holding"}.`,
    });
  }

  const thin = recent.length < 3;
  const loggedDays = recent.filter(isDayLogged).slice(0, 60);

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Hist<span className="text-brand-green">ory</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">Look back, spot the pattern — what&apos;s working and what&apos;s not.</p>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database didn&apos;t respond — refresh in a moment.
        </div>
      )}

      {thin && !dbError && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/50">
          Not much logged yet — this fills in as Ashlee logs each day. Come back in a week and the
          trends light up.
        </div>
      )}

      {/* ── THIS MONTH vs LAST ─────────────────────────────────────── */}
      <section className="mt-8">
        <div className={EYEBROW}>This month vs last</div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Revenue", now: money(tm.rev), c: pct(tm.rev, lm.rev), show: lm.rev > 0 },
            { label: "Corrections", now: String(tm.corr), c: pct(tm.corr, lm.corr), show: lm.corr > 0 },
            { label: "Leads", now: String(tm.leads), c: pct(tm.leads, lm.leads), show: lm.leads > 0 },
            { label: "Conversion", now: tm.leads ? `${tm.conv}%` : "—", c: pct(tm.conv, lm.conv), show: lm.leads > 0 },
          ].map((m) => (
            <div key={m.label} className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                {m.label}
              </div>
              <div className="mt-1.5 font-display text-2xl font-extrabold tabular-nums text-white">
                {m.now}
              </div>
              {m.show ? (
                <div
                  className={`mt-0.5 text-xs font-bold ${
                    m.c >= 0 ? "text-brand-green" : "text-brand-yellow"
                  }`}
                >
                  {m.c >= 0 ? "▲" : "▼"} {Math.abs(m.c)}% vs last month
                </div>
              ) : (
                <div className="mt-0.5 text-xs text-white/30">no last-month data</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── AUTO INSIGHTS ──────────────────────────────────────────── */}
      {insights.length > 0 && (
        <section className="mt-8">
          <div className={EYEBROW}>What&apos;s working / watch</div>
          <div className="mt-3 flex flex-col gap-2">
            {insights.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 rounded-xl border px-4 py-2.5 text-sm ${
                  a.tone === "green"
                    ? "border-brand-green/30 bg-brand-green/[0.06] text-white/80"
                    : "border-brand-yellow/30 bg-brand-yellow/[0.06] text-white/80"
                }`}
              >
                <span aria-hidden>{a.tone === "green" ? "✅" : "🟡"}</span>
                <span>{a.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── WEEKLY TREND ───────────────────────────────────────────── */}
      <section className="mt-8">
        <div className={EYEBROW}>Week by week</div>
        {weeks.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">No weeks logged yet.</p>
        ) : (
          <div className={`mt-3 overflow-x-auto ${CARD}`}>
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-white/10">
                  {["Week of", "Revenue", "Corr", "Leads", "Conv", "Re-dos"].map((h) => (
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
                {weeks.map((w) => {
                  const conv = w.leads ? Math.round((w.bookings / w.leads) * 100) : 0;
                  return (
                    <tr key={w.week} className="border-b border-white/[0.06] last:border-0">
                      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-white/80">
                        {new Date(`${w.week}T00:00:00+10:00`).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          timeZone: "Australia/Brisbane",
                        })}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-brand-green">{money(w.rev)}</td>
                      <td className="px-3 py-2.5 text-white/70">{w.corr || "—"}</td>
                      <td className="px-3 py-2.5 text-white/70">{w.leads || "—"}</td>
                      <td className="px-3 py-2.5 text-white/60">{w.leads ? `${conv}%` : "—"}</td>
                      <td className={`px-3 py-2.5 ${w.redos > 4 ? "text-brand-yellow" : "text-white/50"}`}>
                        {w.redos || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── DAY BY DAY (click to open a full day report) ───────────── */}
      <section className="mt-8">
        <div className={EYEBROW}>Day by day</div>
        <p className="mt-2 text-xs text-white/40">Tap any day to read every number and note for it.</p>
        {loggedDays.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">No days logged yet.</p>
        ) : (
          <div className={`mt-3 overflow-hidden ${CARD}`}>
            {loggedDays.map((r) => {
              const earned = r.completed_revenue || 0;
              const hrs = dayHours(r.staff_hours);
              const ok = earned >= 2200;
              const snippet = (r.notes_today || "").trim().replace(/\s+/g, " ").slice(0, 60);
              return (
                <a
                  key={r.log_date}
                  href={`/ops/history/${r.log_date}`}
                  className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 transition last:border-0 hover:bg-white/[0.03]"
                >
                  <div className="w-24 shrink-0">
                    <div className="text-sm font-bold text-white/85">
                      {new Date(`${r.log_date}T00:00:00+10:00`).toLocaleDateString("en-AU", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        timeZone: "Australia/Brisbane",
                      })}
                    </div>
                    <div className="text-[11px] text-white/35">{r.jobs_completed || 0} done · {hrs}h</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-black tabular-nums ${ok ? "text-brand-green" : "text-brand-yellow"}`}>
                      {money(earned)} <span className="font-semibold text-white/35">earned</span>
                      <span className="ml-2 text-xs font-semibold text-white/45">{money(r.revenue_collected || 0)} cash</span>
                    </div>
                    {snippet && (
                      <div className="mt-0.5 truncate text-xs text-white/40">{snippet}{(r.notes_today || "").trim().length > 60 ? "…" : ""}</div>
                    )}
                  </div>
                  <span className="shrink-0 text-white/25">›</span>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* ── BEST DAYS ──────────────────────────────────────────────── */}
      {bestDay && (
        <section className="mt-8">
          <div className={EYEBROW}>Which days earn</div>
          <div className={`mt-3 ${CARD} p-4`}>
            <div className="flex flex-col gap-2">
              {wdRows.map((w) => (
                <div key={w.name} className="flex items-center gap-3">
                  <span className="w-9 shrink-0 text-xs font-bold text-white/50">{w.name}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand-green/70"
                      style={{ width: `${w.n ? Math.max(4, (w.avg / maxWdAvg) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-white/60">
                    {w.n ? money(w.avg) : "—"}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-white/30">Average revenue per weekday (days logged).</p>
          </div>
        </section>
      )}

      <div className="mt-8">
        <a
          href="/ops/export"
          className="inline-flex rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/60 transition hover:border-white/35 hover:text-white"
        >
          Export all data (CSV) ↓
        </a>
      </div>

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
