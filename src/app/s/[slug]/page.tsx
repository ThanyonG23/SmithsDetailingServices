import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceJob } from "@/lib/ops/db";
import { STATE_META } from "@/lib/ops/service";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Your Service Report | Smiths Garage",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const LOGO = "/smiths-garage-logo.png";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Brisbane" });
}

export default async function ServiceReportPage({ params }: { params: { slug: string } }) {
  const job = await getServiceJob(params.slug);
  if (!job) notFound();

  const checked = job.checklist.filter((i) => i.state !== "pending");
  const flagged = checked.filter((i) => i.state === "attention" || i.state === "urgent");

  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths Garage" className="mx-auto w-full max-w-[200px] mix-blend-screen" />
          <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Your Service Report</h1>
          <p className="mt-2 text-sm text-white/45">{fmtDate(job.created_at)}</p>
        </div>

        {/* vehicle summary */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Vehicle", v: job.vehicle || "-" },
            { l: "Rego", v: job.rego || "-" },
            { l: "Odometer", v: job.odometer ? `${job.odometer} km` : "-" },
            { l: "Next service", v: job.next_service || "-" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{s.l}</div>
              <div className="mt-1 text-sm font-bold text-white">{s.v}</div>
            </div>
          ))}
        </div>

        {/* anything needing attention, up top */}
        {flagged.length > 0 && (
          <div className="mt-6 rounded-2xl border border-brand-yellow/30 bg-brand-yellow/[0.05] p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-yellow">Worth keeping an eye on</div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {flagged.map((it) => (
                <li key={it.key} className="flex items-start gap-2 text-sm text-white/80">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATE_META[it.state].dot}`} />
                  <span><b>{it.label}</b>{it.detail && <span className="text-white/60">, {it.detail}</span>}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* full checklist */}
        <div className="mt-6 flex flex-col gap-2.5">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">What we checked</div>
          {checked.map((it) => (
            <div key={it.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-base font-extrabold tracking-tight text-white">{it.label}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATE_META[it.state].badge}`}>
                  {it.state === "ok" ? "Good" : it.state === "attention" ? "Keep an eye on" : it.state === "urgent" ? "Needs attention" : "N/A"}
                </span>
              </div>
              {it.detail && <p className="mt-1.5 text-sm text-white/60">{it.detail}</p>}
              {it.photos.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {it.photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={p} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))}
          {checked.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/45">
              This report is being prepared, check back shortly.
            </div>
          )}
        </div>

        {job.notes && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">From the team</div>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{job.notes}</p>
          </div>
        )}

        <footer className="mt-10 text-center text-sm text-white/40">
          {job.technician && <p>Serviced by {job.technician}</p>}
          <p className="mt-2">{BUSINESS.name} · {BUSINESS.address}</p>
          <p className="mt-1">
            <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-brand-purple-soft hover:text-white">{BUSINESS.phone}</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
