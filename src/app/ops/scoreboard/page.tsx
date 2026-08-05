import type { Metadata } from "next";
import { requireAuth, getRole } from "@/lib/ops/auth";
import { getJobsForDate, getAnalytics, type AnalyticsDay } from "@/lib/ops/db";
import { OPS_TARGETS, BONUS, cairnsToday } from "@/lib/ops/config";

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
  const role = getRole();

  const today = cairnsToday();
  const anchor = new Date(today + "T00:00:00Z");
  const dow = anchor.getUTCDay();
  const weekStart = shift(today, -((dow + 6) % 7)); // Monday

  const { aimRevenue, breakEvenRevenue, weeklyTarget, jobsTarget } = OPS_TARGETS;

  let todayEarned = 0,
    todayJobs = 0,
    todayCorr = 0;
  let series: AnalyticsDay[] = [];
  let dbError = false;
  try {
    const floor = await getJobsForDate(today);
    const live = floor.filter((j) => !j.cancelled);
    todayEarned = live.reduce((a, j) => a + j.value, 0);
    todayJobs = live.length;
    todayCorr = live.filter((j) => j.is_correction).length;
    series = await getAnalytics(weekStart, today);
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
  const pot = weekSurplus * BONUS.rate;

  const todayPct = (todayEarned / aimRevenue) * 100;
  const weekPct = (weekEarned / weeklyTarget) * 100;
  const toAim = Math.max(0, aimRevenue - todayEarned);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className={EYEBROW}>Smiths Detailing · Team</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Score<span className="text-brand-green">board</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        How the team&apos;s tracking against target, today and this week.
        {role === "crew" && " Read-only — nice work out there. 🙌"}
      </p>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Numbers didn&apos;t load — refresh in a moment.
        </div>
      )}

      {/* ── TODAY ── */}
      <section className="mt-7">
        <div className={`${CARD} p-5`}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                Today
              </div>
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
      <section className="mt-8">
        <div className={`${CARD} p-5`}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                This week
              </div>
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

      {/* ── TARGETS ── */}
      <section className="mt-8">
        <div className={EYEBROW}>What we&apos;re aiming at</div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="Aim / day" value={money(aimRevenue)} />
          <Mini label="Break-even / day" value={money(breakEvenRevenue)} />
          <Mini label="Week target" value={money(weeklyTarget)} />
          <Mini label="Corrections / day" value={String(jobsTarget)} />
        </div>
      </section>

      {/* ── BONUS ── */}
      <section className="mt-8">
        <div
          className={`rounded-2xl border p-5 ${
            BONUS.live
              ? "border-brand-green/40 bg-brand-green/[0.06]"
              : "border-white/12 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              🏆
            </span>
            <span className="text-sm font-black uppercase tracking-wider text-white">
              Performance bonus
            </span>
            {!BONUS.live && (
              <span className="rounded-full bg-brand-yellow/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-yellow">
                Coming soon
              </span>
            )}
          </div>

          {BONUS.live ? (
            <>
              <div className="mt-3 font-display text-3xl font-extrabold tabular-nums text-brand-green">
                {money(pot)}
              </div>
              <p className="mt-1 text-sm text-white/60">
                The crew pool so far this week — {Math.round(BONUS.rate * 100)}% of everything earned
                above break-even, split between the detailers. It grows every day you beat{" "}
                {money(breakEvenRevenue)}.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-white/60">
              Soon, every day the team beats{" "}
              <span className="font-bold text-white/80">{money(breakEvenRevenue)}</span>, a share of
              everything above it goes into a crew bonus pool — split between the detailers. The more
              corrections out the door, the bigger it gets. Keep smashing the aim and it&apos;ll be
              waiting for you. 💪
            </p>
          )}
        </div>
      </section>

      <p className="mt-10 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team
      </p>
    </main>
  );
}
