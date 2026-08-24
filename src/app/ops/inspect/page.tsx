import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/ops/auth";
import {
  getJobsForDate,
  getCarryoverJobs,
  listRecentInspections,
  type JobWithHours,
  type Inspection,
} from "@/lib/ops/db";
import { cairnsToday } from "@/lib/ops/config";
import { startInspection } from "../actions";

export const metadata: Metadata = {
  title: "Inspect | Smiths Detailing",
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
function nameOf(summary: string): string {
  const [n] = (summary || "").split(":");
  return (n || "").trim();
}

export default async function InspectPage() {
  requireAuth();
  const today = cairnsToday();

  let jobs: JobWithHours[] = [];
  let carryover: JobWithHours[] = [];
  let inspections: Inspection[] = [];
  let dbError = false;
  try {
    jobs = await getJobsForDate(today);
    carryover = await getCarryoverJobs(today, shift(today, -13));
    inspections = await listRecentInspections(40);
  } catch {
    dbError = true;
  }

  // cars physically on the floor = today's + carried-over, deduped, minus no-shows
  const floor = [...jobs, ...carryover.filter((c) => !jobs.some((j) => j.uid === c.uid))].filter(
    (j) => !j.cancelled
  );
  const byUid = new Map(inspections.filter((i) => i.booking_uid).map((i) => [i.booking_uid, i]));

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        In<span className="text-brand-green">spect</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-white/50">
        Clean the car, inspect it, then build the customer a photo report of the extras you&apos;d
        recommend. Send them the link, they tick what they want and send it back.
      </p>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database didn&apos;t respond, refresh in a moment.
        </div>
      )}

      {/* cars on the floor today */}
      <section className="mt-8">
        <div className={EYEBROW}>Cars in today · start an inspection</div>
        {floor.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">
            No cars on the calendar for today, upload the latest calendar if that looks wrong.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {floor.map((j) => {
              const existing = byUid.get(j.uid);
              return (
                <div key={j.uid} className={`${CARD} p-4`}>
                  <div className="font-display text-base font-extrabold tracking-tight text-white">
                    {nameOf(j.summary) || "(no name)"}
                  </div>
                  <div className="mt-0.5 text-xs text-white/50">
                    {j.car ? `🚗 ${j.car} · ` : ""}
                    {money(j.value)}
                    {j.is_correction && <span className="text-brand-green"> · correction</span>}
                  </div>
                  {existing ? (
                    <Link
                      href={`/ops/inspect/${existing.slug}`}
                      className="mt-3 inline-flex rounded-full border border-brand-green/40 bg-brand-green/[0.08] px-4 py-2 text-xs font-black text-brand-green transition hover:bg-brand-green/15"
                    >
                      {existing.status === "responded"
                        ? "✓ Replied, open"
                        : `Open inspection (${existing.items.length})`}
                    </Link>
                  ) : (
                    <form action={startInspection} className="mt-3">
                      <input type="hidden" name="uid" value={j.uid} />
                      <input type="hidden" name="name" value={nameOf(j.summary)} />
                      <input type="hidden" name="vehicle" value={j.car || ""} />
                      <input type="hidden" name="member" value={/member/i.test(j.summary) ? "1" : "0"} />
                      <button className="rounded-full bg-brand-green px-4 py-2 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
                        + Start inspection
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <form action={startInspection} className="mt-3">
          <input type="hidden" name="uid" value="" />
          <button className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/60 transition hover:border-white/35 hover:text-white">
            + Blank inspection (walk-in / not on calendar)
          </button>
        </form>
      </section>

      {/* recent inspections + responses */}
      <section className="mt-10">
        <div className={EYEBROW}>Recent inspections</div>
        {inspections.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">None yet, start one above.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {inspections.map((insp) => {
              const rate = (p: number) => (insp.member ? p * 0.9 : p);
              const chosen = insp.items.filter((i) => i.selected);
              const chosenTotal = chosen.reduce((a, i) => a + rate(i.price), 0);
              const offered = insp.items.reduce((a, i) => a + i.price, 0);
              const tone =
                insp.status === "responded"
                  ? "border-brand-green/40 bg-brand-green/[0.05]"
                  : "border-white/10 bg-white/[0.02]";
              return (
                <Link key={insp.slug} href={`/ops/inspect/${insp.slug}`} className={`rounded-2xl border p-4 transition hover:border-white/25 ${tone}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-display text-base font-extrabold tracking-tight text-white">
                        {insp.customer_name || "(no name)"}
                      </div>
                      {insp.vehicle && <div className="truncate text-xs text-white/50">🚗 {insp.vehicle}</div>}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        insp.status === "responded"
                          ? "bg-brand-green/15 text-brand-green"
                          : insp.status === "sent"
                          ? "bg-brand-yellow/15 text-brand-yellow"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {insp.status === "responded" ? "Replied" : insp.status === "sent" ? "Sent" : "Draft"}
                    </span>
                  </div>
                  {insp.status === "responded" ? (
                    <div className="mt-2 text-xs text-white/60">
                      Wants <b className="text-brand-green">{chosen.length}</b> of {insp.items.length} extras ·{" "}
                      <b className="text-brand-green">{money(chosenTotal)}</b>
                      {insp.customer_note && (
                        <div className="mt-1 rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5 text-white/70">
                          “{insp.customer_note}”
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-white/45">
                      {insp.items.length} extra{insp.items.length === 1 ? "" : "s"} · {money(offered)} offered
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
