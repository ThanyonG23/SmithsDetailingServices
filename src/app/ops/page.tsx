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

/* --- brand tokens ----------------------------------------------------- */
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const FIELD =
  "w-full rounded-xl border border-white/12 bg-black/40 text-white outline-none transition placeholder:text-white/25 focus:border-brand-green";

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
      : "border-white/10 bg-white/[0.02]";
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
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

  let entry: DailyLog | null = null;
  let recent: DailyLog[] = [];
  let dbError = false;
  try {
    entry = await getDailyLog(date);
    recent = await getRecentLogs(30);
  } catch {
    // No database connected yet (or a bad connection string). Don't crash
    // the whole page — show a notice and let login/UI still render.
    dbError = true;
  }

  const rev = entry?.revenue_collected ?? 0;
  const status = revenueStatus(rev);
  const { breakEvenRevenue, aimRevenue, jobsTarget } = OPS_TARGETS;
  const aimPct = Math.min(100, Math.round((rev / aimRevenue) * 100));
  const bePct = Math.min(100, Math.round((breakEvenRevenue / aimRevenue) * 100));

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-10">
      {/* ── header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={EYEBROW}>Smiths Detailing · Cairns</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Daily <span className="text-brand-green">Ops</span>
          </h1>
        </div>
        <form action={logout}>
          <button className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/60 transition hover:border-white/35 hover:text-white">
            Log out
          </button>
        </form>
      </div>

      {/* date bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-display font-extrabold text-white">{date}</span>
        {isToday ? (
          <span className="rounded-full bg-brand-green/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-green">
            Today
          </span>
        ) : (
          <Link
            href="/ops"
            className="rounded-full border border-white/12 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white/60 transition hover:text-white"
          >
            ← Back to today
          </Link>
        )}
        {entry?.updated_at && (
          <span className="text-xs text-white/30">
            saved {entry.updated_at.replace("T", " ")}
          </span>
        )}
      </div>

      {saved && (
        <div className="mt-5 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-3 text-sm font-semibold text-brand-green">
          Saved ✓
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

      {/* ── SCOREBOARD ───────────────────────────────────────────── */}
      <section className="mt-7">
        <div
          className={`rounded-3xl border p-6 ${
            status.tone === "green"
              ? "border-brand-green/40 bg-brand-green/[0.06]"
              : status.tone === "yellow"
              ? "border-brand-yellow/40 bg-brand-yellow/[0.06]"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className={EYEBROW}>Revenue collected</div>
              <div className="mt-2 font-display text-[2.75rem] font-extrabold leading-none tabular-nums text-white">
                {money(rev)}
              </div>
            </div>
            <div
              className={`pb-1 text-right text-sm font-black ${
                status.tone === "yellow" ? "text-brand-yellow" : "text-brand-green"
              }`}
            >
              {status.label}
            </div>
          </div>

          {/* progress toward the aim, with the break-even marker */}
          <div className="relative mt-5 h-3 overflow-hidden rounded-full bg-white/10">
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
          <div className="mt-2 flex justify-between text-[11px] font-semibold text-white/40">
            <span>Break-even {money(breakEvenRevenue)}</span>
            <span>Aim {money(aimRevenue)}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Jobs done"
            value={String(entry?.jobs_completed ?? 0)}
            sub={`aim ${jobsTarget}/day`}
            tone={(entry?.jobs_completed ?? 0) >= jobsTarget ? "green" : "neutral"}
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

      {/* ── ENTRY FORM ───────────────────────────────────────────── */}
      <form action={saveEntry} className={`mt-8 ${CARD} p-6`}>
        <h2 className="font-display text-lg font-extrabold tracking-tight text-white">
          {entry ? "Update today's log" : "Log the day"}
        </h2>

        <div className="mt-4 flex flex-col gap-1.5">
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

        {/* staff hours */}
        <div className="mt-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
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
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              Notes about today
            </span>
            <textarea
              name="notes_today"
              rows={4}
              defaultValue={entry?.notes_today ?? ""}
              placeholder="What happened, hold-ups, wins…"
              className={`${FIELD} px-3 py-3`}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              Notes about staff
            </span>
            <textarea
              name="notes_staff"
              rows={4}
              defaultValue={entry?.notes_staff ?? ""}
              placeholder="Who did well, who to watch, sent home early…"
              className={`${FIELD} px-3 py-3`}
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-brand-green px-6 py-3.5 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95 sm:w-auto sm:px-12"
        >
          Save the day →
        </button>
      </form>

      {/* ── HISTORY ──────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-extrabold tracking-tight text-white">
          Last 30 days
        </h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">
            No days logged yet — your first entry will show here.
          </p>
        ) : (
          <div className={`mt-3 overflow-x-auto ${CARD}`}>
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

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
