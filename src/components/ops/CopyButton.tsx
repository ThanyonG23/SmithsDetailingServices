"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked, ignore */
        }
      }}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
        done
          ? "border-brand-green/50 bg-brand-green/15 text-brand-green"
          : "border-white/15 text-white/70 hover:border-brand-green hover:text-brand-green"
      }`}
    >
      {done ? "Copied ✓" : label}
    </button>
  );
}
