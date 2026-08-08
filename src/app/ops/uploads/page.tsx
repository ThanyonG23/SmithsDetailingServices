import type { Metadata } from "next";
import { requireOwner } from "@/lib/ops/auth";
import { getLeadStats, type LeadStats } from "@/lib/ops/db";
import { uploadCalendar, uploadAds, uploadLeads } from "../actions";
import { cairnsToday } from "@/lib/ops/config";

export const metadata: Metadata = {
  title: "Uploads | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";

function shift(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function UploadCard({
  emoji, title, blurb, action, field, accept, ctaErr, ok, okLabel,
}: {
  emoji: string; title: string; blurb: string;
  action: (fd: FormData) => void; field: string; accept: string;
  ctaErr?: string; ok?: string; okLabel?: string;
}) {
  return (
    <form action={action} className={`${CARD} flex flex-col p-5`}>
      <div className="flex items-center gap-2.5">
        <span className="text-2xl" aria-hidden>{emoji}</span>
        <span className="font-display text-lg font-extrabold text-white">{title}</span>
      </div>
      <p className="mt-1.5 flex-1 text-sm text-white/55">{blurb}</p>
      {ok && (
        <div className="mt-3 rounded-lg border border-brand-green/40 bg-brand-green/[0.08] px-3 py-2 text-xs font-bold text-brand-green">
          {okLabel}
        </div>
      )}
      {ctaErr && (
        <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/[0.08] px-3 py-2 text-xs font-bold text-red-300">
          {ctaErr}
        </div>
      )}
      <input
        type="file"
        name={field}
        accept={accept}
        required
        className="mt-3 w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/15"
      />
      <button className="mt-3 rounded-full bg-brand-green px-5 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
        Upload {title}
      </button>
    </form>
  );
}

export default async function UploadsPage({
  searchParams,
}: {
  searchParams: { calok?: string; adok?: string; leadok?: string; calerr?: string; aderr?: string; leaderr?: string };
}) {
  requireOwner();

  const today = cairnsToday();
  const anchor = new Date(today + "T00:00:00Z");
  const weekStart = shift(today, -(((anchor.getUTCDay() + 6) % 7)));

  let leads: LeadStats = { total: 0, newThisWeek: 0, backlog: 0, convertedThisWeek: 0, loadedAt: null };
  try {
    leads = await getLeadStats(weekStart);
  } catch {
    /* leave zeros */
  }

  const errMsg = (code?: string) =>
    code === "nofile" ? "No file picked — choose the file and try again."
      : code === "noics" ? "Couldn't find the Smiths Bookings calendar in that zip."
      : code === "noads" ? "That didn't look like the ads export — check the file."
      : code === "noleads" ? "That didn't look like the leads export — check the file."
      : undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Up<span className="text-brand-green">loads</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Do these every <b className="text-white/70">morning</b> and <b className="text-white/70">afternoon</b> — drop
        the file, hit upload. Everything else in the ops manager runs off these three.
      </p>

      {/* ── LEADS FLAGS (the reason to upload leads daily) ── */}
      {leads.total > 0 && (
        <section className="mt-6">
          <div className={EYEBROW}>From your last leads upload</div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">To follow up</div>
              <div className={`mt-1 font-display text-3xl font-extrabold tabular-nums ${leads.backlog > 0 ? "text-brand-yellow" : "text-white"}`}>
                {leads.backlog}
              </div>
              <div className="mt-0.5 text-[11px] text-white/45">warm leads not yet booked or closed</div>
            </div>
            <div className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">New this week</div>
              <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-white">{leads.newThisWeek}</div>
              <div className="mt-0.5 text-[11px] text-white/45">fresh enquiries</div>
            </div>
            <div className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Converted (wk)</div>
              <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-brand-green">{leads.convertedThisWeek}</div>
              <div className="mt-0.5 text-[11px] text-white/45">marked converted</div>
            </div>
          </div>
          {leads.backlog > 0 && (
            <div className="mt-3 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.07] px-4 py-2.5 text-sm text-brand-yellow">
              🟡 <b>{leads.backlog} warm leads</b> are sitting in follow-up — work these first, they&apos;re your
              fastest bookings (already paid for).
            </div>
          )}
          <p className="mt-2 text-[11px] text-white/35">
            Last leads upload: {leads.loadedAt || "—"} · mark leads &ldquo;Converted&rdquo; in the Leads Centre so this stays accurate.
          </p>
        </section>
      )}

      {/* ── THE THREE UPLOADS ── */}
      <section className="mt-8">
        <div className={EYEBROW}>The three uploads</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <UploadCard
            emoji="📅" title="Calendar" field="cal" accept=".zip,.ics" action={uploadCalendar}
            blurb="Google Calendar export (.zip or .ics). Refreshes bookings, jobs, the team board and CRM."
            ok={searchParams?.calok} okLabel={`✓ ${searchParams?.calok} bookings synced`}
            ctaErr={errMsg(searchParams?.calerr)}
          />
          <UploadCard
            emoji="📊" title="Ads" field="ads" accept=".csv" action={uploadAds}
            blurb="Meta Ads export (.csv). Updates ad spend, leads and cost-per-lead."
            ok={searchParams?.adok} okLabel={`✓ ${searchParams?.adok} ads updated`}
            ctaErr={errMsg(searchParams?.aderr)}
          />
          <UploadCard
            emoji="👥" title="Leads" field="leads" accept=".csv" action={uploadLeads}
            blurb="Leads Centre export (leads.csv). Flags your follow-up backlog and tracks conversions per ad."
            ok={searchParams?.leadok} okLabel={`✓ ${searchParams?.leadok} leads loaded`}
            ctaErr={errMsg(searchParams?.leaderr)}
          />
        </div>
      </section>

      {/* ── the routine ── */}
      <section className="mt-8">
        <div className={`${CARD} p-5`}>
          <div className={EYEBROW}>The daily routine</div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm font-black text-white">🌅 Morning</div>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-white/60 marker:text-brand-green">
                <li>Upload the <b className="text-white/80">Leads</b> export → work the follow-up backlog first.</li>
                <li>Upload the <b className="text-white/80">Calendar</b> → today&apos;s jobs on the board.</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-black text-white">🌆 Afternoon</div>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-white/60 marker:text-brand-green">
                <li>Upload the <b className="text-white/80">Ads</b> export → refresh spend &amp; leads.</li>
                <li>Re-upload <b className="text-white/80">Leads</b> &amp; <b className="text-white/80">Calendar</b> → catch the day&apos;s new bookings.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <p className="mt-10 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
