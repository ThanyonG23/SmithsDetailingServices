"use client";

import { useEffect, useState } from "react";

/* Live countdown to a target ISO datetime (e.g. the draw's entry cut-off).
   Renders "--" until mounted to avoid a hydration mismatch, then ticks every second. */
export default function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now === null ? 0 : Math.max(0, targetMs - now);
  const units = [
    { label: "Days", v: Math.floor(diff / 86400000) },
    { label: "Hrs", v: Math.floor((diff % 86400000) / 3600000) },
    { label: "Min", v: Math.floor((diff % 3600000) / 60000) },
    { label: "Sec", v: Math.floor((diff % 60000) / 1000) },
  ];

  return (
    <div className="flex gap-2" aria-label="Time left to enter the draw">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex min-w-[50px] flex-col items-center rounded-lg border border-brand-yellow/30 bg-black/40 px-2 py-1.5"
        >
          <span className="font-display text-lg font-black tabular-nums text-brand-yellow">
            {now === null ? "--" : String(u.v).padStart(2, "0")}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/45">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
