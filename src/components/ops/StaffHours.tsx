"use client";

import { useState } from "react";
import { hoursBetween, LABOUR_RATE, isSalaried, dailySalaryCost } from "@/lib/ops/config";

type Seed = { start?: string; end?: string; notes?: string };

/* One card per crew member: start/finish times with hours computed live,
   plus a private notes box for how they went. Inputs are named
   start_<name> / end_<name> / notes_<name> so the save action reads them
   straight off the form. */
export default function StaffHours({
  staff,
  initial,
}: {
  staff: string[];
  initial: Record<string, Seed>;
}) {
  const [shifts, setShifts] = useState<Record<string, { start: string; end: string }>>(
    () => {
      const seed: Record<string, { start: string; end: string }> = {};
      for (const name of staff) {
        seed[name] = {
          start: initial?.[name]?.start ?? "",
          end: initial?.[name]?.end ?? "",
        };
      }
      return seed;
    }
  );

  const update = (name: string, key: "start" | "end", value: string) =>
    setShifts((prev) => ({ ...prev, [name]: { ...prev[name], [key]: value } }));

  const total =
    Math.round(
      staff.reduce((a, n) => a + hoursBetween(shifts[n]?.start, shifts[n]?.end), 0) * 100
    ) / 100;

  // Detailers cost hours × rate; salaried staff (Ashlee) cost a fixed daily
  // amount if they worked, NOT hours × rate.
  const hourlyCost = staff.reduce(
    (a, n) => (isSalaried(n) ? a : a + hoursBetween(shifts[n]?.start, shifts[n]?.end) * LABOUR_RATE),
    0
  );
  const salariedCost = staff.reduce(
    (a, n) =>
      isSalaried(n) && hoursBetween(shifts[n]?.start, shifts[n]?.end) > 0
        ? a + dailySalaryCost(n)
        : a,
    0
  );
  const labourCost = Math.round(hourlyCost + salariedCost);
  const salariedWorked = staff.filter((n) => isSalaried(n) && hoursBetween(shifts[n]?.start, shifts[n]?.end) > 0);

  return (
    <div className="flex flex-col gap-3">
      {staff.map((name) => {
        const s = shifts[name] ?? { start: "", end: "" };
        const h = hoursBetween(s.start, s.end);
        const active = h > 0;
        return (
          <div
            key={name}
            className={`group rounded-2xl border p-4 transition ${
              active
                ? "border-brand-green/25 bg-brand-green/[0.03]"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-display text-sm font-extrabold transition ${
                  active
                    ? "border-brand-green/40 bg-brand-green/15 text-brand-green"
                    : "border-white/15 bg-white/5 text-white/50"
                }`}
              >
                {name.charAt(0)}
              </span>
              <span className="min-w-0 flex-1 truncate font-display text-base font-extrabold tracking-tight text-white">
                {name}
                {isSalaried(name) && (
                  <span className="ml-2 rounded-full bg-white/8 px-2 py-0.5 align-middle text-[9px] font-bold uppercase tracking-wider text-white/45">
                    salary
                  </span>
                )}
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums transition ${
                  active ? "bg-brand-green/15 text-brand-green" : "bg-white/5 text-white/35"
                }`}
              >
                {active ? `${h}h` : "—"}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="time"
                name={`start_${name}`}
                value={s.start}
                onChange={(e) => update(name, "start", e.target.value)}
                aria-label={`${name} start time`}
                className="min-w-0 flex-1 rounded-lg border border-white/12 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-green"
              />
              <span className="shrink-0 text-xs font-bold text-white/25" aria-hidden>
                →
              </span>
              <input
                type="time"
                name={`end_${name}`}
                value={s.end}
                onChange={(e) => update(name, "end", e.target.value)}
                aria-label={`${name} finish time`}
                className="min-w-0 flex-1 rounded-lg border border-white/12 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-green"
              />
            </div>

            <textarea
              name={`notes_${name}`}
              rows={2}
              defaultValue={initial?.[name]?.notes ?? ""}
              placeholder={`Notes on ${name} — attitude, quality, anything to remember…`}
              className="mt-2.5 w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-brand-green"
            />
          </div>
        );
      })}

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
            Total hours today
          </span>
          <div className="mt-0.5 text-[11px] font-semibold text-white/45">
            Detailers @ ${LABOUR_RATE}/hr
            {salariedWorked.length > 0 && ` + ${salariedWorked.join(", ")} on salary`}
          </div>
        </div>
        <div className="text-right">
          <span className="font-display text-lg font-extrabold tabular-nums text-brand-green">
            {total}h
          </span>
          <div className="mt-0.5 font-display text-sm font-extrabold tabular-nums text-white/80">
            ${labourCost.toLocaleString("en-AU")}
          </div>
        </div>
      </div>
    </div>
  );
}
