"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";
import { removeTemplate } from "@/app/ops/actions";
import type { Template } from "@/lib/ops/db";

export type TemplateGroup = { key: string; title: string; emoji: string; items: Template[] };

/** Pull the "size" out of a template title: "Premium Detail — SUV ($430)" → "SUV ($430)". */
function sizeLabel(title: string): string {
  const parts = (title || "").split(/\s[—–-]\s/);
  return ((parts.length > 1 ? parts.slice(1).join(" — ") : title) || "Template").trim();
}

export default function TemplateGroups({ groups }: { groups: TemplateGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mt-6 flex flex-col gap-3">
      {groups.map((g) => {
        const isOpen = open === g.key;
        return (
          <div
            key={g.key}
            className={`overflow-hidden rounded-2xl border transition ${
              isOpen ? "border-brand-green/40 bg-brand-green/[0.04]" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : g.key)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-white/[0.03]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>
                  {g.emoji}
                </span>
                <div>
                  <div className="font-display text-lg font-extrabold tracking-tight text-white">
                    {g.title}
                  </div>
                  <div className="text-xs text-white/40">
                    {g.items.length} size{g.items.length === 1 ? "" : "s"} · tap to open
                  </div>
                </div>
              </div>
              <span
                className={`shrink-0 text-lg text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                ▾
              </span>
            </button>

            {isOpen && (
              <div className="flex flex-col gap-2 border-t border-white/10 p-3">
                {g.items.map((t) => {
                  const body = t.body.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
                  return (
                    <div key={t.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1 truncate text-sm font-bold text-white">
                          {sizeLabel(t.title)}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <CopyButton text={body} />
                          <form action={removeTemplate}>
                            <button
                              name="id"
                              value={t.id}
                              aria-label="Delete template"
                              className="text-sm font-bold text-white/25 transition hover:text-red-400"
                            >
                              ✕
                            </button>
                          </form>
                        </div>
                      </div>
                      <details className="mt-1.5">
                        <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-wider text-white/30 transition hover:text-white/60">
                          Preview message
                        </summary>
                        <pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-white/70">
                          {body}
                        </pre>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
