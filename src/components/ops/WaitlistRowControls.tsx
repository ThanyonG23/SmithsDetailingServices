"use client";

import { useTransition } from "react";
import { WAITLIST_STAGES, stageOf } from "@/lib/ops/waitlist-stages";

export default function WaitlistRowControls({
  id,
  status,
  onStage,
  onDelete,
}: {
  id: number;
  status: string;
  onStage: (id: number, stage: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  const current = stageOf(status);

  return (
    <div className="flex shrink-0 items-center gap-2">
      <select
        value={current}
        disabled={pending}
        onChange={(e) => {
          const v = e.target.value;
          start(() => onStage(id, v));
        }}
        className="rounded-lg border border-white/15 bg-black/50 px-2.5 py-1.5 text-xs font-bold text-white outline-none transition focus:border-brand-green disabled:opacity-50"
        aria-label="Set stage"
      >
        {WAITLIST_STAGES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this waitlist entry? This can't be undone.")) start(() => onDelete(id));
        }}
        className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-bold text-white/40 transition hover:border-red-500/60 hover:text-red-400 disabled:opacity-50"
        aria-label="Delete entry"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}
