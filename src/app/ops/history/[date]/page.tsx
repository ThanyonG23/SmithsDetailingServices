import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/ops/auth";
import { getDailyLog, getJobHoursForDate, type DailyLog } from "@/lib/ops/db";
import { OPS_TARGETS, OPS_STAFF, LABOUR_RATE } from "@/lib/ops/config";

export const metadata: Metadata = {
  title: "Day report | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";

function totalHours(sh: Record<string, number> | undefined): number {
  if (!sh || typeof sh !== "object") return 0;
  const t = Object.values(sh).reduce((a, b) => a + (Number(b) || 0), 0);
  return Math.round(t * 100) / 100;
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "green" | "yellow" }) {
  return (
    <div className={`${CARD} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div
        className={`mt-1.5 font-display text-2xl font-extrabold tabular-nums ${
          tone === "green" ? "text-brand-green" : tone === "yellow" ? "text-brand-yellow" : "text-white"
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-white/40">{sub}</div>}
    </div>
  );
}

export default async function DayReportPage({ params }: { params: { date: string } }) {
  requireOwner();

  const date = decodeURIComponent(params.date || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  let entry: DailyLog | null = null;
  let cars: Awaited<ReturnType<typeof getJobHoursForDate>> = [];
  let dbError = false;
  try {
    const data = await Promise.race([
      (async () => ({ entry: await getDailyLog(date), cars: await getJobHoursForDate(date) }))(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 20000)),
    ]);
    ({ entry, cars } = data);
  } catch {
    dbError = true;
  }

  const dateLabel = new Date(`${date}T00:00:00+10:00`).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Brisbane",
  });

  const { breakEvenRevenue, aimRevenue } = OPS_TARGETS;
  const earned = entry?.completed_revenue ?? 0;
  const collected = entry?.revenue_collected ?? 0;
  const hrs = totalHours(entry?.staff_hours);
  const labour = hrs * LABOUR_RATE;
  const profit = earned - breakEvenRevenue;
  const perHour = hrs > 0 ? earned / hrs : 0;
  const carsHours = cars.reduce((a, c) => a + c.hours, 0);

  const crew = OPS_STAFF.map((name) => ({
    name,
    hours: entry?.staff_hours?.[name] ?? 0,
    shift: entry?.staff_shifts?.[name],
    note: entry?.staff_notes?.[name] ?? "",
  })).filter((c) => c.hours > 0 || c.shift || c.note.trim());

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <Link
        href="/ops/history"
        className="inline-flex rounded-full border border-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/60 transition hover:text-white"
      >
        ← Back to history
      </Link>

      <div className={`${EYEBROW} mt-5`}>Day report</div>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {dateLabel}
      </h1>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database didn&apos;t respond, refresh in a moment.
        </div>
      )}

      {!dbError && !entry ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-white/55">
          Nothing was logged for this day.{" "}
          <Link href={`/ops?date=${date}`} className="font-semibold text-brand-green hover:underline">
            Log it now →
          </Link>
        </div>
      ) : (
        <>
          {/* headline: earned vs break-even */}
          <section className="mt-6">
            <div
              className={`rounded-3xl border p-6 ${
                earned >= breakEvenRevenue
                  ? "border-brand-green/40 bg-brand-green/[0.05]"
                  : "border-brand-yellow/40 bg-brand-yellow/[0.05]"
              }`}
            >
              <div className={EYEBROW}>Revenue earned</div>
              <div className="mt-2 font-display text-5xl font-extrabold tabular-nums text-white">
                {money(earned)}
              </div>
              <div className="mt-1.5 text-sm font-semibold text-white/50">
                {money(collected)} cash collected · break-even {money(breakEvenRevenue)} · aim {money(aimRevenue)}
              </div>
              <div className="mt-3 text-sm font-bold">
                <span className={profit >= 0 ? "text-brand-green" : "text-brand-yellow"}>
                  {profit >= 0 ? "+" : ""}
                  {money(profit)} vs break-even
                </span>
              </div>
            </div>
          </section>

          {/* the numbers */}
          <section className="mt-6">
            <div className={EYEBROW}>The numbers</div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Earned" value={money(earned)} tone={earned >= breakEvenRevenue ? "green" : "yellow"} />
              <Stat label="Cash collected" value={money(collected)} />
              <Stat label="Jobs completed" value={String(entry?.jobs_completed ?? 0)} />
              <Stat label="Ad spend" value={money(entry?.ad_spend ?? 0)} />
              <Stat label="Other leads" value={String(entry?.messages ?? 0)} sub="SMS/web/call" />
              <Stat label="Quotes sent" value={String(entry?.quotes ?? 0)} />
              <Stat label="Re-dos" value={String(entry?.redos ?? 0)} tone={(entry?.redos ?? 0) > 0 ? "yellow" : undefined} />
              <Stat
                label="Rev / hour"
                value={perHour > 0 ? `${money(perHour)}` : "-"}
                sub="earned ÷ crew hrs"
              />
            </div>
          </section>

          {/* labour */}
          <section className="mt-6">
            <div className={EYEBROW}>Labour</div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Stat label="Crew hours" value={`${hrs}h`} />
              <Stat label={`Labour @ $${LABOUR_RATE}/hr`} value={money(labour)} />
              <Stat
                label="Labour % of earned"
                value={earned > 0 ? `${Math.round((labour / earned) * 100)}%` : "-"}
                tone={earned > 0 && labour / earned > 0.45 ? "yellow" : undefined}
              />
            </div>
          </section>

          {/* who was on */}
          {crew.length > 0 && (
            <section className="mt-6">
              <div className={EYEBROW}>Who was on</div>
              <div className="mt-3 flex flex-col gap-2">
                {crew.map((c) => (
                  <div key={c.name} className={`${CARD} p-4`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-base font-extrabold tracking-tight text-white">
                        {c.name}
                      </span>
                      <span className="shrink-0 text-xs font-bold tabular-nums text-brand-green">
                        {c.hours > 0 ? `${c.hours}h` : "-"}
                        {c.shift && (
                          <span className="ml-2 font-semibold text-white/40">
                            {c.shift.start}–{c.shift.end}
                          </span>
                        )}
                      </span>
                    </div>
                    {c.note.trim() && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/60">{c.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* cars worked that day */}
          {cars.length > 0 && (
            <section className="mt-6">
              <div className={EYEBROW}>Cars worked ({carsHours}h on cars)</div>
              <div className={`mt-3 ${CARD} flex flex-col gap-2 p-4`}>
                {cars.map((c) => (
                  <div
                    key={c.uid}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white/85">
                        {c.summary || "(no title)"}
                      </div>
                      <div className="text-xs text-white/40">
                        {money(c.value)}
                        {c.is_correction && <span className="ml-1.5 font-bold text-brand-green">· correction</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-bold tabular-nums text-white/80">{c.hours}h</div>
                      <div className="text-xs font-semibold tabular-nums text-brand-green">
                        {c.hours > 0 ? `${money(c.value / c.hours)}/hr` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* the story */}
          <section className="mt-6">
            <div className={EYEBROW}>How the day went</div>
            {entry?.notes_today?.trim() ? (
              <div className={`mt-3 ${CARD} p-5`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">
                  {entry.notes_today}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/40">No notes written for this day.</p>
            )}
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/ops?date=${date}`}
              className="inline-flex rounded-full bg-brand-green px-5 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95"
            >
              Edit this day →
            </Link>
            {entry?.updated_at && (
              <span className="inline-flex items-center text-xs text-white/35">
                Last saved {entry.updated_at.replace("T", " ")}
              </span>
            )}
          </div>
        </>
      )}

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
