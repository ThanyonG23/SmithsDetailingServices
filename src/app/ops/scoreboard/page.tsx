import type { Metadata } from "next";
import { requireAuth, getRole } from "@/lib/ops/auth";
import {
  getJobsForDate,
  getAnalytics,
  getCompletedJobs,
  type AnalyticsDay,
  type CompletedJob,
} from "@/lib/ops/db";
import {
  OPS_TARGETS,
  BONUS,
  MOTTO,
  TARGET_HOURS,
  EXTRA_HOURS,
  targetHoursForJob,
  cairnsToday,
} from "@/lib/ops/config";

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
  const pot = weekSurplus * BONUS.rate;

  const todayPct = (todayEarned / aimRevenue) * 100;
  const weekPct = (weekEarned / weeklyTarget) * 100;
  const toAim = Math.max(0, aimRevenue - todayEarned);

  // The crew work cars TOGETHER, so we score the team, not individuals. Cars
  // done + how many beat the clock + team hours vs target. The crew roll is each
  // person's OWN clock hours (that part is individual) — shown as contribution,
  // never ranked.
  const carsDone = completed.length;
  let teamBeat = 0;
  let totalActual = 0;
  let totalTarget = 0;
  const rollMap: Record<string, number> = {};
  for (const j of completed) {
    const t = targetHoursForJob(j);
    totalActual += j.total_hours;
    totalTarget += t;
    if (j.total_hours <= t) teamBeat += 1;
    for (const c of j.crew) rollMap[c.detailer] = (rollMap[c.detailer] || 0) + c.hours;
  }
  const teamDiff = Math.round((totalTarget - totalActual) * 10) / 10;
  const crewRoll = Object.entries(rollMap)
    .map(([name, hours]) => ({ name, hours }))
    .sort((a, b) => b.hours - a.hours);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className={EYEBROW}>Smiths Detailing · Team</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Score<span className="text-brand-green">board</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Two targets, two jobs: <span className="text-white/70">revenue is the shop&apos;s goal</span>{" "}
        (booking the work is on the owner), and <span className="text-brand-green">the clock is yours</span>{" "}
        — get every car done at or under its target hours.
        {role === "crew" && " Nice work out there. 🙌"}
      </p>

      <div className="mt-6 rounded-2xl border border-brand-green/25 bg-gradient-to-b from-brand-green/[0.08] to-transparent px-5 py-6 text-center">
        <p className="font-display text-xl font-extrabold italic tracking-tight text-white sm:text-2xl">
          &ldquo;{MOTTO}&rdquo;
        </p>
      </div>

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

      {/* ── TEAM THIS WEEK ── */}
      {carsDone > 0 && (
        <section className="mt-8">
          <div className={EYEBROW}>🏁 Team this week</div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Mini label="Cars done" value={String(carsDone)} tone="green" />
            <Mini label="Beat the clock" value={`${teamBeat}/${carsDone}`} tone="green" />
            <Mini
              label="Team vs target"
              value={teamDiff >= 0 ? `${teamDiff}h under` : `${Math.abs(teamDiff)}h over`}
              tone={teamDiff >= 0 ? "green" : undefined}
            />
          </div>
          {crewRoll.length > 0 && (
            <div className={`${CARD} mt-3 p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                On the tools this week
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {crewRoll.map((c) => (
                  <span
                    key={c.name}
                    className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold tabular-nums text-white/75"
                  >
                    {c.name} · {Math.round(c.hours * 10) / 10}h
                  </span>
                ))}
              </div>
              <p className="mt-2.5 text-[11px] text-white/35">
                We win as a team — every car beaten together.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ── COMPLETED THIS WEEK (actual vs target) ── */}
      <section className="mt-8">
        <div className={EYEBROW}>Completed this week · actual vs target</div>
        {completed.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">
            No cars marked done yet this week — as jobs get ticked Done, they land here with who
            worked them and whether they beat the clock.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {completed.map((j) => {
              const [nm, ...rest] = (j.summary || "").split(":");
              const pkg = rest.join(":").trim();
              const target = targetHoursForJob(j);
              const beat = j.total_hours <= target;
              const diff = Math.round(Math.abs(target - j.total_hours) * 10) / 10;
              return (
                <div key={j.uid} className={`${CARD} p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white/90">
                        🚗 {j.car || nm?.trim() || "Car"}
                      </div>
                      {pkg && <div className="truncate text-xs font-semibold text-brand-green">{pkg}</div>}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-display text-lg font-extrabold tabular-nums text-white">
                        {Math.round(j.total_hours * 10) / 10}h
                        <span className="text-xs font-semibold text-white/35"> / {target}h</span>
                      </div>
                      <div
                        className={`mt-0.5 text-[11px] font-black ${
                          beat ? "text-brand-green" : "text-red-300"
                        }`}
                      >
                        {beat ? `Beat by ${diff}h ✓` : `Over by ${diff}h`}
                      </div>
                    </div>
                  </div>
                  {j.crew.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {j.crew.map((c) => (
                        <span
                          key={c.detailer}
                          className="rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white/70"
                        >
                          {c.detailer} · {Math.round(c.hours * 10) / 10}h
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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

      {/* ── BEAT THE CLOCK (crew KPI) ── */}
      <section className="mt-8">
        <div className={EYEBROW}>Beat the clock · your target per car</div>
        <p className="mt-2 text-sm text-white/50">
          This is your number. Get each car done at or under its target hours — that&apos;s what
          you control, and it&apos;s what the bonus will be built on.
        </p>
        <div className={`${CARD} mt-3 overflow-hidden`}>
          {TARGET_HOURS.map((t, i) => (
            <div
              key={t.package}
              className={`flex items-center justify-between px-4 py-3 ${
                i > 0 ? "border-t border-white/8" : ""
              }`}
            >
              <span className="text-sm font-semibold text-white/85">{t.package}</span>
              <span className="font-display text-lg font-extrabold tabular-nums text-brand-green">
                {t.hours}h
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
          <span className="font-semibold text-white/60">Extras add on top:</span>
          {EXTRA_HOURS.map((e) => (
            <span key={e.name}>
              {e.name} <b className="text-brand-green">+{e.hours}h</b>
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-white/35">
          Actual-vs-target per car lights up here once the car timers are dialled in.
        </p>
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
                The crew pool so far this week, split between the detailers. It grows when the team
                hits its targets — cars done inside the clock and good days on the board. Keep it
                climbing.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-white/60">
              Soon, hitting your targets pays. Get your cars done{" "}
              <span className="font-bold text-white/80">inside the clock</span>, and help the team hit
              its days, and a bonus pool builds for the crew to split. The better and faster the work,
              the bigger it gets. Keep smashing your targets and it&apos;ll be waiting for you. 💪
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
