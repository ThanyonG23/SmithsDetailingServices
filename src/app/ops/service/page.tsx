import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/ops/auth";
import { listServiceJobs, type ServiceJob } from "@/lib/ops/db";
import { STATE_META } from "@/lib/ops/service";
import { startService } from "../actions";

export const metadata: Metadata = {
  title: "Servicing | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const INPUT = "w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green";
const LABEL = "mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-white/40";

function dayLabel(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Brisbane" });
}

export default async function ServiceListPage() {
  requireAuth();
  let jobs: ServiceJob[] = [];
  try {
    jobs = await listServiceJobs();
  } catch {
    /* leave [] */
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className={EYEBROW}>Smiths Garage</div>
      <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Servicing</h1>
      <p className="mt-1 text-sm text-white/45">Fill out a service card on your phone as you go, then send the customer their report.</p>

      {/* new service */}
      <form action={startService} className={`${CARD} mt-6 p-5`}>
        <div className={`${EYEBROW} mb-3`}>New service card</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className={LABEL}>Rego *</label><input name="rego" required className={INPUT} placeholder="ABC123" /></div>
          <div><label className={LABEL}>Vehicle</label><input name="vehicle" className={INPUT} placeholder="2009 Toyota Prado" /></div>
          <div><label className={LABEL}>Odometer (km)</label><input name="odometer" className={INPUT} placeholder="128500" inputMode="numeric" /></div>
          <div><label className={LABEL}>Customer</label><input name="customer_name" className={INPUT} placeholder="Name" /></div>
          <div><label className={LABEL}>Phone</label><input name="customer_phone" className={INPUT} placeholder="0456 000 000" /></div>
          <div><label className={LABEL}>Technician</label><input name="technician" className={INPUT} placeholder="Who's doing it" /></div>
        </div>
        <button className="mt-4 rounded-full bg-brand-green px-6 py-2.5 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
          Start service →
        </button>
      </form>

      {/* recent jobs */}
      <div className="mt-8">
        <div className={`${EYEBROW} mb-3`}>Recent ({jobs.length})</div>
        {jobs.length === 0 ? (
          <div className={`${CARD} px-4 py-8 text-center text-sm text-white/45`}>No service cards yet — start one above.</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {jobs.map((j) => {
              const flags = j.checklist.filter((i) => i.state === "attention" || i.state === "urgent").length;
              return (
                <Link key={j.slug} href={`/ops/service/${j.slug}`} className={`${CARD} flex items-center justify-between gap-3 p-4 transition hover:border-white/25`}>
                  <div className="min-w-0">
                    <div className="font-display text-base font-extrabold tracking-tight text-white">
                      {j.rego || "—"}{j.vehicle && <span className="text-white/50"> · {j.vehicle}</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-white/45">
                      {j.customer_name || "Walk-in"}{j.odometer && ` · ${j.odometer} km`} · {dayLabel(j.created_at)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {flags > 0 && <span className="rounded-full bg-brand-yellow/15 px-2 py-0.5 text-[10px] font-bold text-brand-yellow">{flags} to action</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${j.status === "completed" ? STATE_META.ok.badge : "bg-white/8 text-white/50"}`}>
                      {j.status === "completed" ? "Done" : "In progress"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
