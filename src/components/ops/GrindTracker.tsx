"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getTrackerData,
  bumpStat,
  saveNotes,
  addLead,
  updateLead,
  logFollowUp,
  deleteLead,
  type TrackerData,
  type Lead,
} from "@/app/ops/tracker/actions";

/* Daily Grind: the scoreboard the owner ticks off every day (emails, doors,
   follow-ups, posts vs targets) plus a lead follow-up log so nothing leaks. */

const TARGETS = { emails: 50, doors: 20, followups: 8, posts: 1 } as const;
const STAT_META: { key: keyof typeof TARGETS; label: string; steps: number[] }[] = [
  { key: "emails", label: "Cold emails", steps: [1, 5, 10] },
  { key: "doors", label: "Doors knocked", steps: [1, 5] },
  { key: "followups", label: "Follow-ups", steps: [1] },
  { key: "posts", label: "Posts live", steps: [1] },
];
const STATUSES = ["New", "Contacted", "Follow up", "Won", "Dead"];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(base: string, n: number): string {
  const d = new Date(base + "T00:00:00");
  d.setDate(d.getDate() + n);
  return ymd(d);
}
function prettyDate(s: string): string {
  try {
    return new Date(s + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
  } catch {
    return s;
  }
}

export default function GrindTracker() {
  const today = useMemo(() => ymd(new Date()), []);
  const [data, setData] = useState<TrackerData | null>(null);
  const [busy, setBusy] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [biz, setBiz] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    getTrackerData(today)
      .then((d) => {
        setData(d);
        setNotesDraft(d.today.notes);
      })
      .catch(() => {});
  }, [today]);

  async function run(fn: () => Promise<TrackerData>) {
    setBusy(true);
    try {
      setData(await fn());
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-white/50">Loading…</div>;
  }

  const t = data.today;
  const dayDone =
    t.emails >= TARGETS.emails && t.doors >= TARGETS.doors && t.followups >= TARGETS.followups && t.posts >= TARGETS.posts;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Daily <span className="text-brand-green">Grind</span>
          </h1>
          <div className="mt-1 text-sm text-white/45">{prettyDate(today)}</div>
        </div>
        {dayDone && (
          <span className="shrink-0 rounded-full bg-brand-green/15 px-4 py-2 text-sm font-black uppercase tracking-wider text-brand-green">
            ✓ Day done
          </span>
        )}
      </div>

      {/* scoreboard */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_META.map((m) => {
          const val = t[m.key];
          const target = TARGETS[m.key];
          const hit = val >= target;
          const pct = Math.min(100, Math.round((val / target) * 100));
          return (
            <div
              key={m.key}
              className={`rounded-2xl border p-4 ${hit ? "border-brand-green/40 bg-brand-green/[0.06]" : "border-white/10 bg-white/[0.02]"}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/45">{m.label}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`font-display text-3xl font-black tabular-nums ${hit ? "text-brand-green" : "text-white"}`}>{val}</span>
                <span className="text-xs font-bold text-white/40">/ {target}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${hit ? "bg-brand-green" : "bg-white/40"}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => run(() => bumpStat(today, m.key, -1))}
                  disabled={busy}
                  className="h-7 w-7 rounded-lg border border-white/15 text-sm font-black text-white/60 transition hover:border-white/35 hover:text-white disabled:opacity-40"
                >
                  −
                </button>
                {m.steps.map((s) => (
                  <button
                    key={s}
                    onClick={() => run(() => bumpStat(today, m.key, s))}
                    disabled={busy}
                    className="h-7 rounded-lg bg-brand-green px-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 disabled:opacity-40"
                  >
                    +{s}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-day streak */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Last 7 days</div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {data.recent.length === 0 && <span className="text-sm text-white/40">No history yet, today&apos;s the first.</span>}
          {[...data.recent].reverse().map((r) => {
            const done = r.emails >= TARGETS.emails && r.doors >= TARGETS.doors && r.followups >= TARGETS.followups && r.posts >= TARGETS.posts;
            return (
              <div key={r.date} className="flex shrink-0 flex-col items-center gap-1">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${
                    done ? "bg-brand-green/20 text-brand-green" : "border border-white/10 bg-white/[0.02] text-white/30"
                  }`}
                >
                  {done ? "✓" : "·"}
                </div>
                <div className="text-[9px] text-white/40">{new Date(r.date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* today's notes */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Today&apos;s notes</div>
        <textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          onBlur={() => notesDraft !== t.notes && run(() => saveNotes(today, notesDraft))}
          rows={2}
          placeholder="Wins, blockers, who to chase tomorrow…"
          className="mt-2 w-full resize-y rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
        />
      </div>

      {/* leads */}
      <div className="mt-8">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">Leads &amp; follow-ups</h2>
        <p className="mt-1 text-sm text-white/45">Every business you touch. The money is in the follow-up, chase everything due.</p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={biz}
            onChange={(e) => setBiz(e.target.value)}
            placeholder="Business name"
            className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact (name / phone / email)"
            className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
          />
          <button
            onClick={() => {
              if (!biz.trim()) return;
              run(() => addLead(today, biz, contact, "")).then(() => {
                setBiz("");
                setContact("");
              });
            }}
            disabled={busy || !biz.trim()}
            className="shrink-0 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-black text-[#04130a] transition hover:brightness-110 disabled:opacity-40"
          >
            Add lead
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {data.leads.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/12 p-6 text-center text-sm text-white/40">
              No leads yet. Add every business you email or door.
            </div>
          )}
          {data.leads.map((l) => (
            <LeadRow key={l.id} lead={l} today={today} busy={busy} run={run} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadRow({
  lead,
  today,
  busy,
  run,
}: {
  lead: Lead;
  today: string;
  busy: boolean;
  run: (fn: () => Promise<TrackerData>) => void;
}) {
  const overdue = lead.next_followup && lead.next_followup <= today && lead.status !== "Won" && lead.status !== "Dead";
  const statusColor =
    lead.status === "Won"
      ? "text-brand-green"
      : lead.status === "Dead"
        ? "text-white/40"
        : lead.status === "Follow up"
          ? "text-brand-yellow"
          : "text-brand-purple-soft";

  return (
    <div className={`rounded-2xl border p-4 ${overdue ? "border-brand-yellow/40 bg-brand-yellow/[0.05]" : "border-white/10 bg-white/[0.02]"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-base font-extrabold text-white">{lead.business}</div>
          {lead.contact && <div className="mt-0.5 text-sm text-white/55">{lead.contact}</div>}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <select
              value={lead.status}
              onChange={(e) => run(() => updateLead(today, lead.id, { status: e.target.value }))}
              disabled={busy}
              className={`rounded-lg border border-white/12 bg-black/40 px-2 py-1 font-bold ${statusColor} outline-none focus:border-brand-green`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#0a0a0a] text-white">
                  {s}
                </option>
              ))}
            </select>
            {lead.next_followup && (
              <span className={overdue ? "font-bold text-brand-yellow" : "text-white/45"}>
                {overdue ? "⚠ due " : "next "}
                {prettyDate(lead.next_followup)}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <button
            onClick={() => run(() => logFollowUp(today, lead.id, addDays(today, 3)))}
            disabled={busy}
            className="rounded-lg bg-brand-green/90 px-3 py-1.5 text-xs font-black text-[#04130a] transition hover:brightness-110 disabled:opacity-40"
          >
            Followed up ✓
          </button>
          <button
            onClick={() => run(() => deleteLead(today, lead.id))}
            disabled={busy}
            className="text-[11px] text-white/35 underline underline-offset-2 hover:text-white/70"
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
}
