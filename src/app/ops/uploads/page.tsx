import type { Metadata } from "next";
import { requireOwner } from "@/lib/ops/auth";
import { getLeadAnalytics, getSalesStats, type LeadAnalytics, type SalesStats } from "@/lib/ops/db";
import { uploadCalendar, uploadAds, uploadLeads, uploadSales } from "../actions";
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
  searchParams: {
    calok?: string; adok?: string; leadok?: string; saleok?: string;
    calerr?: string; aderr?: string; leaderr?: string; saleerr?: string;
  };
}) {
  requireOwner();

  const today = cairnsToday();
  const anchor = new Date(today + "T00:00:00Z");
  const weekStart = shift(today, -(((anchor.getUTCDay() + 6) % 7)));
  const monthStart = today.slice(0, 8) + "01";

  let leads: LeadAnalytics | null = null;
  let sales: SalesStats | null = null;
  try {
    leads = await getLeadAnalytics(weekStart, today, today);
    sales = await getSalesStats(monthStart, today);
  } catch {
    /* leave null — the flags just won't render */
  }
  const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");

  const errMsg = (code?: string) =>
    code === "nofile" ? "No file picked — choose the file and try again."
      : code === "noics" ? "Couldn't find the Smiths Bookings calendar in that zip."
      : code === "noads" ? "That didn't look like the ads export — check the file."
      : code === "noleads" ? "That didn't look like the leads export — check the file."
      : code === "nosales" ? "That didn't look like the Xero SalesInvoices export — check the file."
      : undefined;

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Up<span className="text-brand-green">loads</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Do these every <b className="text-white/70">morning</b> and <b className="text-white/70">afternoon</b> — drop
        the file, hit upload. Everything else in the ops manager runs off these three.
      </p>

      {/* ── LEADS FLAGS (the reason to upload leads daily) ── */}
      {leads && leads.total > 0 && (
        <section className="mt-6">
          <div className={EYEBROW}>From your last leads upload</div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Chase now</div>
              <div className={`mt-1 font-display text-3xl font-extrabold tabular-nums ${leads.fuFresh > 0 ? "text-brand-green" : "text-white"}`}>
                {leads.fuFresh}
              </div>
              <div className="mt-0.5 text-[11px] text-white/45">fresh follow-ups (≤7 days)</div>
            </div>
            <div className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">In follow-up</div>
              <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-white/80">{leads.followUp}</div>
              <div className="mt-0.5 text-[11px] text-white/45">total not yet won or lost</div>
            </div>
            <div className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">New this week</div>
              <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-white">{leads.newInPeriod}</div>
              <div className="mt-0.5 text-[11px] text-white/45">fresh enquiries</div>
            </div>
            <div className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Converted (wk)</div>
              <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-brand-green">{leads.convertedInPeriod}</div>
              <div className="mt-0.5 text-[11px] text-white/45">this week&apos;s leads, won</div>
            </div>
          </div>

          {/* aging strip — turns the big backlog into a chase list */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-brand-green/15 px-3 py-1 font-semibold text-brand-green">Fresh ≤7d · {leads.fuFresh}</span>
            <span className="rounded-full bg-white/8 px-3 py-1 font-semibold text-white/70">Warm 8–21d · {leads.fuWarm}</span>
            <span className="rounded-full bg-white/8 px-3 py-1 font-semibold text-white/70">Stale 22–60d · {leads.fuStale}</span>
            <span className="rounded-full bg-red-500/15 px-3 py-1 font-semibold text-red-300">Cold 60d+ · {leads.fuCold}</span>
          </div>

          {leads.fuFresh > 0 && (
            <div className="mt-3 rounded-xl border border-brand-green/40 bg-brand-green/[0.07] px-4 py-2.5 text-sm text-brand-green">
              🟢 <b>{leads.fuFresh} fresh follow-ups</b> to chase today — these convert fastest. Leave the
              cold pile; mark those Abused so the backlog reads true.
            </div>
          )}
          <p className="mt-2 text-[11px] text-white/35">
            Last leads upload: {leads.loadedAt || "—"} · full funnel on the{" "}
            <b className="text-white/50">Analytics</b> tab · mark leads &ldquo;Converted&rdquo; / &ldquo;Abused&rdquo; in the
            Leads Centre so this stays accurate.
          </p>
        </section>
      )}

      {/* ── REAL REVENUE FLAG (from Xero) ── */}
      {sales && sales.allTimeInvoices > 0 && (
        <section className="mt-6">
          <div className={EYEBROW}>Real revenue · from Xero</div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">This month</div>
              <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-brand-green">{money(sales.revenue)}</div>
              <div className="mt-0.5 text-[11px] text-white/45">{sales.invoices} invoice{sales.invoices === 1 ? "" : "s"}</div>
            </div>
            <div className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Avg invoice</div>
              <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-white">{sales.invoices ? money(sales.avg) : "—"}</div>
              <div className="mt-0.5 text-[11px] text-white/45">real, incl. upsells</div>
            </div>
            <div className={`${CARD} p-4`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">All-time loaded</div>
              <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-white">{money(sales.allTimeRevenue)}</div>
              <div className="mt-0.5 text-[11px] text-white/45">{sales.allTimeInvoices} invoices</div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-white/35">
            Last Xero upload: {sales.loadedAt || "—"} · real numbers &amp; conversion on the{" "}
            <b className="text-white/50">Analytics</b> tab.
          </p>
        </section>
      )}

      {/* ── THE UPLOADS ── */}
      <section className="mt-8">
        <div className={EYEBROW}>The uploads</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
          <UploadCard
            emoji="💰" title="Sales" field="sales" accept=".csv" action={uploadSales}
            blurb="Xero SalesInvoices export (.csv). Real revenue + true conversion (which ad actually got paid)."
            ok={searchParams?.saleok} okLabel={`✓ ${searchParams?.saleok} invoices loaded`}
            ctaErr={errMsg(searchParams?.saleerr)}
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
