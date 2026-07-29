import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/ops/auth";
import { getDailyLog, getRecentLogs, type DailyLog } from "@/lib/ops/db";
import { OPS_STAFF, OPS_TARGETS, cairnsToday } from "@/lib/ops/config";
import { saveEntry, logout } from "./actions";
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
  searchParams: { date?: string; saved?: string };
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
  const { breakEvenRevenue, aimRevenue, jobsTarget } = OPS_TARGETS;
  const aimPct = Math.min(100, Math.round((rev / aimRevenue) * 100));
  const bePct = Math.min(100, Math.round((breakEvenRevenue / aimRevenue) * 100));

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
          <StatTile label="Bookings" value={String(entry?.bookings ?? 0)} sub="taken today" />
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
            <NumField label="Bookings taken" name="bookings" defaultValue={entry?.bookings ?? ""} />
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
          <SectionTitle eyebrow="The record" title="Last 30 days" />
          {recent.length === 0 ? (
            <p className="text-sm text-white/45">
              No days logged yet — your first entry will show here.
            </p>
          ) : (
            <div className={`overflow-x-auto ${CARD}`}>
              <table className="w-full border-collapse text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Date", "Revenue", "Book", "Done", "🙂", "🙁", "Hrs"].map((h) => (
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
                        <td className="px-3 py-3 text-white/70">{r.bookings}</td>
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
