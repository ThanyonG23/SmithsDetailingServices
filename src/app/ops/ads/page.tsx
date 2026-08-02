import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/ops/auth";
import {
  getAds,
  getGrowthSeries,
  getRecentLogs,
  getRecentBookings,
  type AdRow,
  type GrowthDay,
  type DailyLog,
  type Booking,
} from "@/lib/ops/db";
import { cairnsToday } from "@/lib/ops/config";
import { uploadAds } from "../actions";

export const metadata: Metadata = {
  title: "Ads & Leads | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const dayLabel = (d: string) =>
  new Date(`${d}T00:00:00+10:00`).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Australia/Brisbane",
  });

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const brisDate = (ms: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(new Date(ms));

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <div className={EYEBROW}>{eyebrow}</div>
      <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-white">{title}</h2>
    </div>
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
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className="mt-1.5 font-display text-2xl font-extrabold tabular-nums text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-white/45">{sub}</div>}
    </div>
  );
}

export default async function AdsPage({
  searchParams,
}: {
  searchParams: { adok?: string; aderr?: string };
}) {
  if (!isAuthed()) redirect("/ops/login");

  const today = cairnsToday();
  const from60 = brisDate(Date.now() - 60 * 86400000);
  const wt = new Date(`${today}T12:00:00+10:00`);
  const dow = (wt.getUTCDay() + 6) % 7;
  const weekStart = brisDate(wt.getTime() - dow * 86400000);

  let ads: AdRow[] = [];
  let growth: GrowthDay[] = [];
  let recent: DailyLog[] = [];
  let bookings: Booking[] = [];
  let dbError = false;
  try {
    const data = await Promise.race([
      (async () => ({
        ads: await getAds(),
        growth: await getGrowthSeries(from60, today),
        recent: await getRecentLogs(30),
        bookings: await getRecentBookings(from60),
      }))(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 9000)),
    ]);
    ({ ads, growth, recent, bookings } = data);
  } catch {
    dbError = true;
  }

  // ── ad performance (from the uploaded Meta CSV) ──
  const adSpend = ads.reduce((a, r) => a + r.spend, 0);
  const adMessages = ads.reduce((a, r) => a + r.messages, 0);
  const adNewContacts = ads.reduce((a, r) => a + r.new_contacts, 0);
  const adCostPerMsg = adMessages ? adSpend / adMessages : 0;
  const hasAds = ads.length > 0;

  // ── leads → bookings (last 30 days) ──
  const g30 = growth.slice(0, 30);
  const gOther = g30.reduce((a, g) => a + g.messages, 0);
  const gMeta = g30.reduce((a, g) => a + g.messages_meta, 0);
  const gLeads = gOther + gMeta;
  const gNewBookings = g30.reduce((a, g) => a + g.new_bookings, 0);
  const gNewCorr = g30.reduce((a, g) => a + g.new_corrections, 0);
  const gSpend = g30.reduce((a, g) => a + g.ad_spend, 0);
  const gConv = gLeads ? Math.round((gNewBookings / gLeads) * 100) : 0;
  const gCostBooking = gNewBookings ? gSpend / gNewBookings : 0;
  const gRows = growth
    .slice(0, 14)
    .filter((g) => g.messages || g.messages_meta || g.new_bookings || g.ad_spend);
  const gHasData = gLeads > 0 || gNewBookings > 0;

  // ── funnel (this week) ──
  const inWeek = (r: DailyLog) => r.log_date >= weekStart && r.log_date <= today;
  const weekQuotes = recent.filter(inWeek).reduce((a, r) => a + (r.quotes || 0), 0);
  const weekCompleted = recent.filter(inWeek).reduce((a, r) => a + (r.jobs_completed || 0), 0);
  const weekBookings = bookings.filter((b) => b.booking_date >= weekStart && b.booking_date <= today);
  const weekLeads = growth
    .filter((g) => g.date >= weekStart && g.date <= today)
    .reduce((a, g) => a + g.messages + g.messages_meta, 0);
  const quoteClose = weekQuotes ? Math.round((weekBookings.length / weekQuotes) * 100) : 0;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Ads &amp; <span className="text-brand-green">Leads</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">Where the leads come from, and what they turn into.</p>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database didn&apos;t respond — refresh in a moment.
        </div>
      )}
      {searchParams?.adok && (
        <div className="mt-5 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-3 text-sm font-semibold text-brand-green">
          Ads synced ✓ · {searchParams.adok} ads loaded
        </div>
      )}
      {searchParams?.aderr && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          {searchParams.aderr === "noads"
            ? "Couldn't read any ads in that file — upload the Meta Ads CSV export."
            : "No file received — pick the ads CSV and try again."}
        </div>
      )}

      {/* ── LEADS → BOOKINGS ─────────────────────────────────────── */}
      <section className="mt-8">
        <SectionTitle eyebrow="Last 30 days" title="Leads → bookings" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Leads" value={String(gLeads)} sub={`${gMeta} Meta · ${gOther} other`} />
          <StatTile
            label="New bookings"
            value={String(gNewBookings)}
            sub={`${gNewCorr} corrections`}
            tone={gNewBookings > 0 ? "green" : "neutral"}
          />
          <StatTile
            label="Conversion"
            value={gHasData && gLeads ? `${gConv}%` : "—"}
            sub="leads → booked"
            tone={gConv >= 15 ? "green" : gConv > 0 ? "yellow" : "neutral"}
          />
          <StatTile
            label="Cost / booking"
            value={gCostBooking ? money(gCostBooking) : "—"}
            sub={gLeads ? `${money(gSpend)} spend` : "log ad spend"}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/40">
          Meta leads pull in automatically from a Meta export with a{" "}
          <b className="text-white/60">Day breakdown</b>; other leads (SMS, website, phone) go in the
          daily log. Corrections book weeks out, so read the{" "}
          <b className="text-white/60">trend</b>, not one day.
        </p>

        {gRows.length > 0 ? (
          <div className={`mt-3 overflow-x-auto ${CARD}`}>
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-white/10">
                  {["Date", "Meta", "Other", "Booked", "Corr"].map((h) => (
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
                {gRows.map((g) => (
                  <tr key={g.date} className="border-b border-white/[0.06] last:border-0">
                    <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-white/80">
                      {dayLabel(g.date)}
                    </td>
                    <td className="px-3 py-2.5 text-white/70">{g.messages_meta || "—"}</td>
                    <td className="px-3 py-2.5 text-white/70">{g.messages || "—"}</td>
                    <td className="px-3 py-2.5 font-bold text-brand-green">{g.new_bookings || "—"}</td>
                    <td className="px-3 py-2.5 text-white/60">{g.new_corrections || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-white/45">
            Upload a single-day Meta export + log other leads daily — the conversion trend builds
            from there.
          </p>
        )}
      </section>

      {/* ── FUNNEL (this week) ────────────────────────────────────── */}
      <section className="mt-8">
        <SectionTitle eyebrow="This week" title="The funnel" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Leads" value={String(weekLeads)} sub="logged this week" />
          <StatTile label="Quotes sent" value={String(weekQuotes)} sub="logged this week" />
          <StatTile
            label="Booked"
            value={String(weekBookings.length)}
            sub={weekQuotes ? `${quoteClose}% of quotes` : "log quotes to see %"}
            tone={weekQuotes && quoteClose >= 40 ? "green" : weekQuotes ? "yellow" : "neutral"}
          />
          <StatTile label="Completed" value={String(weekCompleted)} sub="jobs done" />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/40">
          Leads → quotes → booked → completed. High leads but low bookings = the leak is your close
          rate; check response time and the pitch.
        </p>
      </section>

      {/* ── AD PERFORMANCE (Meta) ─────────────────────────────────── */}
      <section className="mt-8">
        <SectionTitle eyebrow="From Meta" title="Ad performance" />
        {hasAds ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Ad spend" value={money(adSpend)} sub="this export" />
              <StatTile
                label="Messages"
                value={String(adMessages)}
                sub="conversations"
                tone={adMessages > 0 ? "green" : "neutral"}
              />
              <StatTile
                label="Cost / message"
                value={adCostPerMsg ? money(adCostPerMsg) : "—"}
                sub="lower is better"
              />
              <StatTile label="New contacts" value={String(adNewContacts)} sub="new people messaging" />
            </div>

            <div className={`mt-3 overflow-x-auto ${CARD}`}>
              <table className="w-full border-collapse text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Ad", "Spend", "Msgs", "$/msg"].map((h) => (
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
                  {ads.map((a, i) => (
                    <tr key={i} className="border-b border-white/[0.06] last:border-0">
                      <td className="max-w-[150px] truncate px-3 py-2.5 font-semibold text-white/85">
                        {a.name}
                      </td>
                      <td className="px-3 py-2.5 text-white/70">{money(a.spend)}</td>
                      <td className="px-3 py-2.5 text-white/70">{a.messages}</td>
                      <td className="px-3 py-2.5 font-bold text-brand-green">
                        {a.cost_per_message ? money(a.cost_per_message) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-white/45">No ads loaded yet — upload the Meta Ads CSV below.</p>
        )}

        <form
          action={uploadAds}
          className={`mt-3 ${CARD} flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div>
            <div className="text-sm font-bold text-white">Sync ad stats</div>
            <div className="mt-0.5 text-xs text-white/45">
              Drop in the Meta Ads CSV. For daily lead tracking, add a{" "}
              <b className="text-white/60">Day breakdown</b> in Meta (Breakdown → By Day) — every
              day&apos;s messages auto-fill the funnel above in one upload.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              name="ads"
              accept=".csv"
              required
              className="max-w-[190px] text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/20"
            />
            <button className="shrink-0 rounded-full bg-brand-green px-5 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
              Upload
            </button>
          </div>
        </form>
      </section>

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
