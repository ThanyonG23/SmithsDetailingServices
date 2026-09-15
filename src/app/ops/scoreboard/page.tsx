import type { Metadata } from "next";
import { requireAuth } from "@/lib/ops/auth";
import {
  getJobsForDate,
  getAnalytics,
  getCompletedJobs,
  type AnalyticsDay,
  type CompletedJob,
} from "@/lib/ops/db";
import { OPS_TARGETS, MOTTO, cairnsToday } from "@/lib/ops/config";

export const metadata: Metadata = {
  title: "Scoreboard | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";

function shift(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function Bar({ pct, hit }: { pct: number; hit: boolean }) {
  return (
    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full transition-all ${hit ? "bg-brand-green" : "bg-brand-yellow"}`}
        style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
      />
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: "green" }) {
  return (
    <div className={`${CARD} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{label}</div>
      <div
        className={`mt-1 font-display text-2xl font-extrabold tabular-nums ${
          tone === "green" ? "text-brand-green" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default async function ScoreboardPage() {
  requireAuth();

  const today = cairnsToday();
  const anchor = new Date(today + "T00:00:00Z");
  const dow = anchor.getUTCDay();
  const weekStart = shift(today, -((dow + 6) % 7)); // Monday

  const { aimRevenue, breakEvenRevenue, weeklyTarget, jobsTarget } = OPS_TARGETS;

  let todayEarned = 0,
    todayJobs = 0,
    todayCorr = 0;
  let series: AnalyticsDay[] = [];
  let completed: CompletedJob[] = [];
  let dbError = false;
  try {
    const floor = await getJobsForDate(today);
    const live = floor.filter((j) => !j.cancelled);
    todayEarned = live.reduce((a, j) => a + j.value, 0);
    todayJobs = live.length;
    todayCorr = live.filter((j) => j.is_correction).length;
    series = await getAnalytics(weekStart, today);
    completed = await getCompletedJobs(weekStart);
  } catch {
    dbError = true;
  }

  // Week = logged earned for past days + today's live floor.
  const past = series.filter((d) => d.date < today);
  const weekEarned = past.reduce((a, d) => a + d.earned, 0) + todayEarned;
  const weekCorr = series.reduce((a, d) => a + d.corrections, 0);
  const opDays = past.filter((d) => d.earned > 0).length + (todayEarned > 0 ? 1 : 0);
  const daysHitAim =
    past.filter((d) => d.earned >= aimRevenue).length + (todayEarned >= aimRevenue ? 1 : 0);
  const weekSurplus = Math.max(0, weekEarned - breakEvenRevenue * Math.max(opDays, 1));

  const todayPct = (todayEarned / aimRevenue) * 100;
  const weekPct = (weekEarned / weeklyTarget) * 100;
  const toAim = Math.max(0, aimRevenue - todayEarned);

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Score<span className="text-brand-green">board</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Your day, your numbers. Revenue against your{" "}
        <span className="text-brand-green">{money(aimRevenue)}</span> aim, and how the week is stacking up.
      </p>

      <div className="mt-6 rounded-2xl border border-brand-green/25 bg-gradient-to-b from-brand-green/[0.08] to-transparent px-5 py-6 text-center">
        <p className="font-display text-xl font-extrabold italic tracking-tight text-white sm:text-2xl">
          &ldquo;{MOTTO}&rdquo;
        </p>
      </div>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Numbers didn&apos;t load, refresh in a moment.
        </div>
      )}

      {/* ── TODAY + THIS WEEK band ───────────────────────────────── */}
      <div className="mt-7 grid gap-4 xl:grid-cols-2 xl:items-start">
        {/* ── TODAY ── */}
        <section>
          <div className={`${CARD} p-5`}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Today</div>
                <div className="mt-1 font-display text-4xl font-extrabold tabular-nums text-brand-green">
                  {money(todayEarned)}
                </div>
              </div>
              <div className="text-right text-xs text-white/50">
                <div>
                  aim <span className="font-bold text-white/70">{money(aimRevenue)}</span>
                </div>
                {toAim > 0 ? (
                  <div className="mt-0.5 font-bold text-brand-yellow">{money(toAim)} to go</div>
                ) : (
                  <div className="mt-0.5 font-bold text-brand-green">Aim smashed 🎯</div>
                )}
              </div>
            </div>
            <Bar pct={todayPct} hit={todayEarned >= aimRevenue} />
            <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-white/35">
              <span>Break-even {money(breakEvenRevenue)}</span>
              <span>Aim {money(aimRevenue)}</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <Mini label="Jobs on today" value={String(todayJobs)} />
            <Mini label="Corrections" value={String(todayCorr)} tone="green" />
            <Mini label="Aim / day" value={money(aimRevenue)} />
          </div>
        </section>

        {/* ── THIS WEEK ── */}
        <section>
          <div className={`${CARD} p-5`}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">This week</div>
                <div className="mt-1 font-display text-4xl font-extrabold tabular-nums text-white">
                  {money(weekEarned)}
                </div>
              </div>
              <div className="text-right text-xs text-white/50">
                <div>
                  target <span className="font-bold text-white/70">{money(weeklyTarget)}</span>
                </div>
                <div className="mt-0.5 font-bold text-white/70">{Math.round(weekPct)}%</div>
              </div>
            </div>
            <Bar pct={weekPct} hit={weekEarned >= weeklyTarget} />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <Mini label="Days hit aim" value={`${daysHitAim}/${Math.max(opDays, 0)}`} />
            <Mini label="Corrections" value={String(weekCorr)} tone="green" />
            <Mini label="Above break-even" value={money(weekSurplus)} tone="green" />
          </div>
        </section>
      </div>

      {/* ── COMPLETED THIS WEEK ── */}
      <section className="mt-8">
        <div className={EYEBROW}>Completed this week</div>
        {completed.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">
            No cars marked done yet this week. As jobs get ticked Done, they land here.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:items-start">
            {completed.map((j) => {
              const [nm, ...rest] = (j.summary || "").split(":");
              const pkg = rest.join(":").trim();
              return (
                <div key={j.uid} className={`${CARD} p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white/90">
                        🚗 {j.car || nm?.trim() || "Car"}
                      </div>
                      {pkg && <div className="truncate text-xs font-semibold text-brand-green">{pkg}</div>}
                    </div>
                    <div className="shrink-0 font-display text-lg font-extrabold tabular-nums text-white">
                      {money(j.value)}
                    </div>
                  </div>
                  {j.signed_by && (
                    <div className="mt-2 text-[11px] font-semibold text-brand-green/80">✓ Signed off</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── TARGETS ── */}
      <section className="mt-8">
        <div className={EYEBROW}>What you&apos;re aiming at</div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="Aim / day" value={money(aimRevenue)} />
          <Mini label="Break-even / day" value={money(breakEvenRevenue)} />
          <Mini label="Week target" value={money(weeklyTarget)} />
          <Mini label="Jobs / day" value={String(jobsTarget)} />
        </div>
      </section>

      <p className="mt-10 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns
      </p>
    </main>
  );
}
