import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/ops/auth";
import { getCustomers, type Customer } from "@/lib/ops/db";

export const metadata: Metadata = {
  title: "CRM | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const INPUT =
  "w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export default async function CrmPage({ searchParams }: { searchParams: { q?: string } }) {
  if (!isAuthed()) redirect("/ops/login");

  const q = (searchParams?.q || "").slice(0, 60);
  let customers: Customer[] = [];
  let dbError = false;
  try {
    customers = await Promise.race([
      getCustomers(q),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 20000)),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        C<span className="text-brand-green">RM</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Every customer — built automatically from the calendar. Tap a number to call, email to write.
      </p>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database didn&apos;t respond — refresh in a moment.
        </div>
      )}

      <form className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, phone, email, car…"
          className={INPUT}
        />
        <button className="shrink-0 rounded-lg border border-white/15 px-4 text-xs font-bold text-white/70 transition hover:border-white/35 hover:text-white">
          Search
        </button>
      </form>

      {customers.length === 0 ? (
        <p className="mt-4 text-sm text-white/45">
          {q
            ? "No customers match that search."
            : "No customers yet — upload the calendar on the Dashboard to build the list."}
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {customers.map((c) => (
            <div key={c.dedupe_key} className={`${CARD} p-3.5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white/90">{c.name || "—"}</div>
                  {c.car && <div className="truncate text-xs text-white/45">{c.car}</div>}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-bold tabular-nums text-brand-green">
                    {money(c.total_value)}
                  </div>
                  <div className="text-[11px] text-white/40">
                    {c.bookings} booking{c.bookings === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {c.phone && (
                  <a
                    href={`tel:${c.phone}`}
                    className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-xs font-semibold text-white/75 transition hover:border-brand-green hover:text-brand-green"
                  >
                    📞 {c.phone}
                  </a>
                )}
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="max-w-full truncate rounded-full border border-white/12 bg-black/30 px-3 py-1 text-xs font-semibold text-white/75 transition hover:border-brand-green hover:text-brand-green"
                  >
                    ✉️ {c.email}
                  </a>
                )}
                {c.last_seen && <span className="text-[11px] text-white/30">last: {c.last_seen}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
