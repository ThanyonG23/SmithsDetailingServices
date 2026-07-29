import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/ops/auth";
import { getDailyLog, getRecentLogs, type DailyLog } from "@/lib/ops/db";
import { OPS_STAFF, OPS_TARGETS, cairnsToday } from "@/lib/ops/config";
import { saveEntry, logout } from "./actions";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");

function totalHours(e: DailyLog | null): number {
  if (!e) return 0;
  return Object.values(e.staff_hours || {}).reduce((a, b) => a + Number(b || 0), 0);
}

function revenueStatus(rev: number) {
  const { breakEvenRevenue, aimRevenue } = OPS_TARGETS;
  if (rev <= 0) return { label: "No revenue logged yet", tone: "neutral" as const };
  if (rev >= aimRevenue) return { label: "Smashing the aim 🔥", tone: "green" as const };
  if (rev >= breakEvenRevenue) return { label: "Above break-even ✓", tone: "green" as const };
  return { label: "Below the line", tone: "yellow" as const };
}

/* --- small presentational helpers ------------------------------------ */

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
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
        {label}
      </span>
      <div className="flex items-center rounded-xl border border-white/12 bg-black/40 focus-within:border-brand-green">
        {prefix && <span className="pl-3 text-white/40">{prefix}</span>}
        <input
          type="number"
          name={name}
          defaultValue={defaultValue}
          min={0}
          step={step}
          inputMode="decimal"
          className="w-full bg-transparent px-3 py-3 text-white outline-none"
        />
      </div>
    </label>
  );
}

function StatCard({
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
  const ring =
    tone === "green"
      ? "border-brand-green/40 bg-brand-green/[0.06]"
      : tone === "yellow"
      ? "border-brand-yellow/40 bg-brand-yellow/[0.06]"
      : "border-white/12 bg-white/[0.03]";
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-white">
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

  const entry = await getDailyLog(date);
  const recent = await getRecentLogs(30);

  const rev = entry?.revenue_collected ?? 0;
  const status = revenueStatus(rev);
  const { breakEvenRevenue, aimRevenue, jobsTarget } = OPS_TARGETS;
  const aimPct = Math.min(100, Math.round((rev / aimRevenue) * 100));
  const bePct = Math.min(100, Math.round((breakEvenRevenue / aimRevenue) * 100));

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-green">
            Smiths Detailing · Cairns
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white">
            Daily Ops
          </h1>
        </div>
        <form action={logout}>
          <button className="rounded-lg border border-white/12 px-3 py-2 text-xs font-semibold text-white/60 transition hover:text-white">
            Log out
          </button>
        </form>
      </div>

      {/* date bar */}
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-white">{date}</span>
        {isToday ? (
          <span className="rounded-full bg-brand-green/15 px-2.5 py-0.5 text-xs font-bold text-brand-green">
            Today
          </span>
        ) : (
          <Link
            href="/ops"
            className="rounded-full border border-white/12 px-2.5 py-0.5 text-xs font-semibold text-white/60 hover:text-white"
          >
            ← Back to today
          </Link>
        )}
        {entry?.updated_at && (
          <span className="text-xs text-white/35">saved {entry.updated_at.replace("T", " ")}</span>
        )}
      </div>

      {saved && (
        <div className="mt-4 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-3 text-sm font-semibold text-brand-green">
          Saved ✓
        </div>
      )}

      {/* ── SCOREBOARD ─────────────────────────────────────────────── */}
      <section className="mt-6">
        <div
          className={`rounded-2xl border p-5 ${
            status.tone === "green"
              ? "border-brand-green/40 bg-brand-green/[0.06]"
              : status.tone === "yellow"
              ? "border-brand-yellow/40 bg-brand-yellow/[0.06]"
              : "border-white/12 bg-white/[0.03]"
          }`}
        >
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                Revenue collected
              </div>
              <div className="mt-1 font-display text-4xl font-extrabold tabular-nums text-white">
                {money(rev)}
              </div>
            </div>
            <div
              className={`pb-1 text-sm font-bold ${
                status.tone === "yellow" ? "text-brand-yellow" : "text-brand-green"
              }`}
            >
              {status.label}
            </div>
          </div>

          {/* progress toward the aim, with the break-even marker */}
          <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${
                rev >= breakEvenRevenue ? "bg-brand-green" : "bg-brand-yellow"
              }`}
              style={{ width: `${aimPct}%` }}
            />
            <div
              className="absolute top-0 h-full w-px bg-white/70"
              style={{ left: `${bePct}%` }}
              aria-hidden
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-white/40">
            <span>Break-even {money(breakEvenRevenue)}</span>
            <span>Aim {money(aimRevenue)}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Jobs done"
            value={String(entry?.jobs_completed ?? 0)}
            sub={`aim ${jobsTarget}/day`}
            tone={
              (entry?.jobs_completed ?? 0) >= jobsTarget ? "green" : "neutral"
            }
          />
          <StatCard label="Bookings" value={String(entry?.bookings ?? 0)} sub="taken today" />
          <StatCard
            label="Happy"
            value={String(entry?.happy_customers ?? 0)}
            tone={(entry?.happy_customers ?? 0) > 0 ? "green" : "neutral"}
          />
          <StatCard
            label="Unhappy"
            value={String(entry?.unhappy_customers ?? 0)}
            tone={(entry?.unhappy_customers ?? 0) > 0 ? "yellow" : "neutral"}
          />
        </div>
      </section>

      {/* ── ENTRY FORM ─────────────────────────────────────────────── */}
      <form action={saveEntry} className="mt-8">
        <h2 className="font-display text-lg font-extrabold text-white">
          {entry ? "Update today's log" : "Log the day"}
        </h2>

        <div className="mt-4 flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
            Date
          </span>
          <input
            type="date"
            name="log_date"
            defaultValue={date}
            className="w-full rounded-xl border border-white/12 bg-black/40 px-3 py-3 text-white outline-none focus:border-brand-green sm:w-auto"
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

        {/* staff hours */}
        <div className="mt-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
            Hours worked
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OPS_STAFF.map((name) => (
              <NumField
                key={name}
                label={name}
                name={`hours_${name}`}
                step={0.5}
                defaultValue={entry?.staff_hours?.[name] ?? ""}
              />
            ))}
          </div>
        </div>

        {/* notes */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
              Notes about today
            </span>
            <textarea
              name="notes_today"
              rows={4}
              defaultValue={entry?.notes_today ?? ""}
              placeholder="What happened, hold-ups, wins…"
              className="w-full rounded-xl border border-white/12 bg-black/40 px-3 py-3 text-white outline-none placeholder:text-white/25 focus:border-brand-green"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
              Notes about staff
            </span>
            <textarea
              name="notes_staff"
              rows={4}
              defaultValue={entry?.notes_staff ?? ""}
              placeholder="Who did well, who to watch, sent home early…"
              className="w-full rounded-xl border border-white/12 bg-black/40 px-3 py-3 text-white outline-none placeholder:text-white/25 focus:border-brand-green"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-brand-green px-4 py-3.5 font-bold text-black transition hover:brightness-110 sm:w-auto sm:px-10"
        >
          Save the day
        </button>
      </form>

      {/* ── HISTORY ────────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-extrabold text-white">Last 30 days</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">
            No days logged yet — your first entry will show here.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-white/12 bg-white/[0.02]">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-white/10">
                  {["Date", "Revenue", "Book", "Done", "🙂", "🙁", "Hrs"].map((h) => (
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
                {recent.map((r) => {
                  const ok = r.revenue_collected >= breakEvenRevenue;
                  return (
                    <tr key={r.log_date} className="border-b border-white/[0.06] last:border-0">
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <Link
                          href={`/ops?date=${r.log_date}`}
                          className="font-semibold text-white/85 underline-offset-4 hover:text-brand-green hover:underline"
                        >
                          {r.log_date}
                        </Link>
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-2.5 font-bold ${
                          ok ? "text-brand-green" : "text-brand-yellow"
                        }`}
                      >
                        {money(r.revenue_collected)}
                      </td>
                      <td className="px-3 py-2.5 text-white/70">{r.bookings}</td>
                      <td className="px-3 py-2.5 text-white/70">{r.jobs_completed}</td>
                      <td className="px-3 py-2.5 text-white/70">{r.happy_customers}</td>
                      <td className="px-3 py-2.5 text-white/70">{r.unhappy_customers}</td>
                      <td className="px-3 py-2.5 text-white/70">{totalHours(r)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
