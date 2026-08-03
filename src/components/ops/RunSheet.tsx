"use client";

import { useState } from "react";
import { RUN_SHEET } from "@/lib/ops/config";
import { saveChecklist } from "@/app/ops/actions";

const PHASES: { key: "Open" | "During" | "Close"; label: string }[] = [
  { key: "Open", label: "🌅 Open" },
  { key: "During", label: "🔧 During the day" },
  { key: "Close", label: "🌆 Close" },
];

export default function RunSheet({ today, initial }: { today: string; initial: string[] }) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(initial));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const toggle = (key: string) => {
    const next = new Set(checked);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setChecked(next);
    setSaveState("saving");
    saveChecklist(today, [...next])
      .then(() => {
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
      })
      .catch(() => setSaveState("idle"));
  };

  const done = RUN_SHEET.filter((i) => checked.has(i.key)).length;
  const total = RUN_SHEET.length;
  const pct = Math.round((done / total) * 100);
  const allDone = done === total;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Ashlee&apos;s run sheet
        </div>
        <div className="flex items-center gap-2">
          {saveState !== "idle" && (
            <span
              className={`text-[11px] font-semibold ${
                saveState === "saved" ? "text-brand-green" : "text-white/40"
              }`}
            >
              {saveState === "saving" ? "Saving…" : "Saved ✓"}
            </span>
          )}
          <span
            className={`text-xs font-black tabular-nums ${
              allDone ? "text-brand-green" : "text-white/50"
            }`}
          >
            {allDone ? "All done 🔥" : `${done}/${total}`}
          </span>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-brand-green transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {PHASES.map((phase) => (
          <div key={phase.key}>
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
              {phase.label}
            </div>
            <div className="flex flex-col gap-1">
              {RUN_SHEET.filter((i) => i.phase === phase.key).map((item) => {
                const on = checked.has(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggle(item.key)}
                    className="group flex items-center gap-3 rounded-lg px-1.5 py-2 text-left transition hover:bg-white/[0.03]"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[11px] transition ${
                        on
                          ? "border-brand-green/60 bg-brand-green/20 text-brand-green"
                          : "border-white/25 text-transparent group-hover:border-brand-green/50"
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={`text-sm transition ${
                        on ? "text-white/35 line-through" : "text-white/85"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-white/30">
        Resets each morning. The <b className="text-white/45">Close</b> steps are what keep the board
        (and the business) running without Thanyon.
      </p>
    </section>
  );
}
