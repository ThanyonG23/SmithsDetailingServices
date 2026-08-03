"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clockOn, clockOff } from "@/app/ops/actions";
import type { TeamJob } from "@/lib/ops/db";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");

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

  // ── name picker ──
  if (!me) {
    return (
      <div className="mt-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Who are you?
        </div>
        <p className="mt-2 text-sm text-white/50">Tap your name — it&apos;s remembered on this device.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {staff.map((name) => (
            <button
              key={name}
              onClick={() => pick(name)}
              className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-6 font-display text-lg font-extrabold text-white transition hover:border-brand-green hover:bg-brand-green/10 active:scale-95"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-green/25 bg-brand-green/[0.05] px-4 py-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-green/70">You are</div>
          <div className="font-display text-xl font-extrabold text-white">{me}</div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("smiths_detailer");
            setMe(null);
          }}
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-white/60 transition hover:text-white"
        >
          Not you?
        </button>
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
            const liveHours = j.hours_today + runningMs / 3600000;
            const busy = busyUid === j.uid;
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
                    <div className="mt-1 text-xs text-white/40">
                      {money(j.value)}
                      {j.is_correction && <span className="ml-1.5 font-bold text-brand-green">· correction</span>}
                      {j.carried && <span className="ml-1.5 font-semibold text-brand-yellow">· carried over</span>}
                    </div>
                    {j.extras && (
                      <div className="mt-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white/70">
                        <span className="font-bold text-white/45">Extras: </span>
                        {j.extras}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-xl font-extrabold tabular-nums text-white">
                      {Math.round(liveHours * 100) / 100}h
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/35">on this car</div>
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

                <button
                  onClick={() => toggle(j.uid, !!mine)}
                  disabled={busy}
                  className={`mt-3 w-full rounded-xl px-4 py-3.5 text-sm font-black transition active:scale-[0.98] disabled:opacity-50 ${
                    mine
                      ? "bg-red-500/90 text-white hover:brightness-110"
                      : "bg-brand-green text-[#04130a] hover:brightness-110"
                  }`}
                >
                  {busy ? "…" : mine ? `■ Stop — ${fmtDur(now - mine.start_ms)}` : "▶ Start on this car"}
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
