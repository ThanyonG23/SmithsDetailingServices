import type { Metadata } from "next";
import { requireOwner } from "@/lib/ops/auth";
import { getAllWaitlist, getWaitlistStats, type WaitlistEntry } from "@/lib/ops/db";
import { GARAGE_SERVICES } from "@/lib/garage";
import { setWaitlistStage, deleteWaitlistEntry } from "../actions";
import WaitlistRowControls, { stageOf } from "@/components/ops/WaitlistRowControls";

export const metadata: Metadata = {
  title: "Waitlist | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";

const SERVICE_LABEL: Record<string, string> = Object.fromEntries(GARAGE_SERVICES.map((s) => [s.id, s.name]));

const SOURCE_LABEL: Record<string, string> = {
  "garage-waitlist": "Garage waitlist",
  "membership-page": "Membership page",
  "membership-signup": "Signed up ✍️",
};

const STAGE_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "New", cls: "bg-white/10 text-white/70" },
  contacted: { label: "Contacted", cls: "bg-sky-500/15 text-sky-300" },
  interested: { label: "Interested", cls: "bg-brand-yellow/15 text-brand-yellow" },
  member: { label: "Member", cls: "bg-brand-green/15 text-brand-green" },
  passed: { label: "Passed", cls: "bg-red-500/10 text-red-300/80" },
};

function Stat({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: "neutral" | "green" | "yellow" }) {
  const accent = tone === "green" ? "before:bg-brand-green" : tone === "yellow" ? "before:bg-brand-yellow" : "before:bg-white/20";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] ${accent}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className="mt-1.5 font-display text-2xl font-extrabold tabular-nums text-white">{value}</div>
    </div>
  );
}

function Row({ w }: { w: WaitlistEntry }) {
  const stage = stageOf(w.status);
  const meta = STAGE_META[stage] || STAGE_META.pending;
  const signup = w.source === "membership-signup";
  const dim = stage === "passed";
  return (
    <div className={`${CARD} p-4 ${dim ? "opacity-55" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>{meta.label}</span>
            <span className="font-display text-base font-extrabold tracking-tight text-white">
              {w.name || "(no name)"}
              {w.vehicle && <span className="text-white/50"> · {w.vehicle}</span>}
            </span>
            {w.membership && (
              <span className="rounded-full bg-brand-yellow/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-yellow">
                Membership
              </span>
            )}
          </div>
          {w.interests.length > 0 && !signup && (
            <div className="mt-1.5 text-xs text-white/50">Wants: {w.interests.map((i) => SERVICE_LABEL[i] || i).join(" · ")}</div>
          )}
          {w.message && <div className="mt-1 text-xs italic text-white/45">{w.message}</div>}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {w.phone && <a href={`tel:${w.phone}`} className="font-bold text-brand-green">📞 {w.phone}</a>}
            {w.email && <a href={`mailto:${w.email}`} className="text-white/60 hover:text-white">✉️ {w.email}</a>}
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${signup ? "bg-brand-green/15 text-brand-green" : "bg-white/5 text-white/40"}`}>
              {SOURCE_LABEL[w.source] || w.source}
            </span>
            <span className="text-white/30">{w.created_at.replace("T", " ")}</span>
          </div>
        </div>
        <WaitlistRowControls id={w.id} status={w.status} onStage={setWaitlistStage} onDelete={deleteWaitlistEntry} />
      </div>
    </div>
  );
}

export default async function WaitlistPage() {
  requireOwner();

  let entries: WaitlistEntry[] = [];
  let stats = { total: 0, pending: 0, actioned: 0, members: 0 };
  let dbError = false;
  try {
    entries = await getAllWaitlist();
    stats = await getWaitlistStats();
  } catch {
    dbError = true;
  }

  const countStage = (s: string) => entries.filter((w) => stageOf(w.status) === s).length;
  const newOnes = entries.filter((w) => stageOf(w.status) === "pending");
  const rest = entries.filter((w) => stageOf(w.status) !== "pending");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className={EYEBROW}>Smiths Garage</div>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white">Waitlist</h1>
        <p className="mt-1 text-sm text-white/45">
          Everyone who&apos;s registered interest or signed up. Set a stage as you work them, or delete an entry. Green source badge = reached the
          Stripe sign-up page (confirm the payment in Stripe before marking them a Member).
        </p>
      </div>

      {dbError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Couldn&apos;t load the waitlist just now — refresh in a moment.
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="New" value={countStage("pending")} />
        <Stat label="Interested" value={countStage("interested")} tone="yellow" />
        <Stat label="Members" value={countStage("member")} tone="green" />
      </div>

      {entries.length === 0 && !dbError && (
        <div className={`${CARD} px-4 py-8 text-center text-sm text-white/45`}>
          No one on the waitlist yet. They&apos;ll show up here the moment someone registers from{" "}
          <span className="text-white/60">/membership</span> or signs up on <span className="text-white/60">/membership/join</span>.
        </div>
      )}

      {newOnes.length > 0 && (
        <section className="mb-8">
          <div className={`${EYEBROW} mb-3`}>New — reach out ({newOnes.length})</div>
          <div className="flex flex-col gap-3">
            {newOnes.map((w) => <Row key={w.id} w={w} />)}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <div className={`${EYEBROW} mb-3`}>Working &amp; done ({rest.length})</div>
          <div className="flex flex-col gap-3">
            {rest.map((w) => <Row key={w.id} w={w} />)}
          </div>
        </section>
      )}
    </main>
  );
}
