"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clockOn, clockOff, saveJobNote } from "@/app/ops/actions";
import type { TeamJob } from "@/lib/ops/db";

function fmtDur(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

export default function TeamBoard({ jobs, staff }: { jobs: TeamJob[]; staff: string[] }) {
  const router = useRouter();
  const [me, setMe] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<Record<string, string>>({});
  const [noteBusy, setNoteBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  // remember who this device belongs to
  useEffect(() => {
    const saved = localStorage.getItem("smiths_detailer");
    if (saved && staff.includes(saved)) setMe(saved);
  }, [staff]);

  // live timers
  useEffect(() => {
    tick.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, []);

  const pick = (name: string) => {
    localStorage.setItem("smiths_detailer", name);
    setMe(name);
  };

  const toggle = (uid: string, active: boolean) => {
    if (!me) return;
    setBusyUid(uid);
    startTransition(async () => {
      if (active) await clockOff(uid, me);
      else await clockOn(uid, me);
      router.refresh();
      setBusyUid(null);
    });
  };

  const openNote = (uid: string, current: string) => {
    setNoteText((t) => ({ ...t, [uid]: t[uid] ?? current }));
    setNoteOpen(uid);
  };
  const saveNote = (uid: string) => {
    setNoteBusy(uid);
    const text = noteText[uid] ?? "";
    startTransition(async () => {
      await saveJobNote(uid, text);
      router.refresh();
      setNoteBusy(null);
      setNoteOpen(null);
    });
  };

  return (
    <div className="mt-6">
      {/* name selector — always visible so the cars are never hidden behind it */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
          You are
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {staff.map((name) => (
            <button
              key={name}
              onClick={() => pick(name)}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition active:scale-95 ${
                me === name
                  ? "bg-brand-green text-[#04130a]"
                  : "border border-white/15 bg-white/[0.03] text-white/70 hover:border-brand-green hover:text-white"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        {!me && (
          <p className="mt-2 text-xs font-semibold text-brand-yellow">
            👆 Tap your name to start clocking cars (remembered on this device).
          </p>
        )}
      </div>

      {jobs.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">
          No cars on the board today. If that looks wrong, ask Ashlee to upload the latest calendar.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {jobs.map((j) => {
            const [name, ...rest] = (j.summary || "").split(":");
            const pkg = rest.join(":").trim();
            const mine = j.active.find((a) => a.detailer === me);
            const others = j.active.filter((a) => a.detailer !== me);
            const runningMs = j.active.reduce((a, x) => a + (now - x.start_ms), 0);
            const liveTotal = j.hours_total + runningMs / 3600000;
            const liveToday = j.hours_today + runningMs / 3600000;
            const busy = busyUid === j.uid;
            // Split into items on delimiters OR on a price (e.g. "…: $100 …: +$85"),
            // then strip any leftover dollar amounts — no pricing on the crew board.
            const extraItems = (j.extras || "")
              .split(/(?::?\s*\+?\$\s*[\d,]+(?:\.\d{1,2})?)|[\n,;·•|]+/)
              .map((s) =>
                s
                  .replace(/\+?\$\s*[\d,]+(?:\.\d{1,2})?/g, "")
                  .replace(/^[\s:+\-–]+|[\s:+\-–]+$/g, "")
                  .replace(/\s+/g, " ")
                  .trim()
              )
              .filter((s) => s.length > 1);
            return (
              <div
                key={j.uid}
                className={`rounded-2xl border p-4 transition ${
                  mine
                    ? "border-brand-green/50 bg-brand-green/[0.06]"
                    : j.carried
                    ? "border-brand-yellow/30 bg-white/[0.02]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg font-extrabold leading-tight text-white">
                      {name?.trim() || "(no name)"}
                    </div>
                    {pkg && <div className="mt-0.5 text-sm font-semibold text-brand-green">{pkg}</div>}
                    {(j.is_correction || j.carried) && (
                      <div className="mt-1 flex flex-wrap gap-x-2 text-xs">
                        {j.is_correction && <span className="font-bold text-brand-green">Correction</span>}
                        {j.carried && <span className="font-semibold text-brand-yellow">Carried over</span>}
                      </div>
                    )}
                    {extraItems.length > 0 && (
                      <div className="mt-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/75">
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                          Extras
                        </div>
                        <ul className="list-disc space-y-0.5 pl-4 marker:text-brand-green">
                          {extraItems.map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-xl font-extrabold tabular-nums text-white">
                      {Math.round(liveTotal * 100) / 100}h
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                      {j.carried ? `${Math.round(liveToday * 100) / 100}h today` : "on this car"}
                    </div>
                  </div>
                </div>

                {/* who's on it right now */}
                {j.active.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {j.active.map((a) => (
                      <span
                        key={a.detailer}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
                          a.detailer === me
                            ? "bg-brand-green/20 text-brand-green"
                            : "bg-white/10 text-white/70"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                        {a.detailer} · {fmtDur(now - a.start_ms)}
                      </span>
                    ))}
                  </div>
                )}

                {/* running note — what still needs doing / to rectify */}
                {noteOpen === j.uid ? (
                  <div className="mt-3">
                    <textarea
                      value={noteText[j.uid] ?? j.note}
                      onChange={(e) => setNoteText((t) => ({ ...t, [j.uid]: e.target.value }))}
                      rows={3}
                      autoFocus
                      placeholder="What still needs doing, anything missed to rectify…"
                      className="w-full resize-y rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green"
                    />
                    <div className="mt-1.5 flex gap-2">
                      <button
                        onClick={() => saveNote(j.uid)}
                        disabled={noteBusy === j.uid}
                        className="rounded-full bg-brand-green px-4 py-1.5 text-xs font-black text-[#04130a] transition active:scale-95 disabled:opacity-50"
                      >
                        {noteBusy === j.uid ? "…" : "Save note"}
                      </button>
                      <button
                        onClick={() => setNoteOpen(null)}
                        className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-bold text-white/60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : j.note ? (
                  <button
                    onClick={() => openNote(j.uid, j.note)}
                    className="mt-3 block w-full rounded-lg border border-brand-yellow/30 bg-brand-yellow/[0.06] px-3 py-2 text-left"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-yellow/80">
                      📝 Notes · tap to edit
                    </span>
                    <span className="mt-0.5 block whitespace-pre-wrap text-sm text-white/85">{j.note}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openNote(j.uid, "")}
                    className="mt-3 text-xs font-bold text-white/45 transition hover:text-brand-green"
                  >
                    ＋ Add a note
                  </button>
                )}

                <button
                  onClick={() => toggle(j.uid, !!mine)}
                  disabled={busy || !me}
                  className={`mt-3 w-full rounded-xl px-4 py-3.5 text-sm font-black transition active:scale-[0.98] disabled:opacity-50 ${
                    !me
                      ? "border border-white/15 bg-white/[0.03] text-white/50"
                      : mine
                      ? "bg-red-500/90 text-white hover:brightness-110"
                      : "bg-brand-green text-[#04130a] hover:brightness-110"
                  }`}
                >
                  {!me
                    ? "Tap your name above first"
                    : busy
                    ? "…"
                    : mine
                    ? `■ Stop — ${fmtDur(now - mine.start_ms)}`
                    : "▶ Start on this car"}
                </button>
                {others.length > 0 && !mine && (
                  <p className="mt-1.5 text-center text-[11px] text-white/35">
                    {others.map((o) => o.detailer).join(", ")} already on it — you can jump on too.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-[11px] leading-relaxed text-white/30">
        Starting a new car automatically stops your last one. Hours roll straight into the day&apos;s
        numbers — no guessing.
      </p>
    </div>
  );
}
