"use client";

import { useState } from "react";
import { submitInspectionResponse } from "@/app/ops/actions";
import type { InspectionItem } from "@/lib/ops/db";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const MEMBER_RATE = 0.9; // members get 10% off every upsell

export default function InspectionView({
  slug,
  customerName,
  vehicle,
  items,
  alreadyResponded,
  member,
}: {
  slug: string;
  customerName: string;
  vehicle: string;
  items: InspectionItem[];
  alreadyResponded: boolean;
  member: boolean;
}) {
  const rate = (p: number) => (member ? p * MEMBER_RATE : p);
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.selected).map((i) => i.id))
  );
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">(alreadyResponded ? "done" : "idle");
  const [err, setErr] = useState<string | null>(null);

  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const total = items.filter((i) => picked.has(i.id)).reduce((a, i) => a + rate(i.price), 0);

  async function send() {
    setState("sending");
    setErr(null);
    try {
      const res = await submitInspectionResponse(slug, [...picked], note);
      if (res.ok) setState("done");
      else {
        setErr("Couldn't send, please try again.");
        setState("idle");
      }
    } catch {
      setErr("Couldn't send, please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    const chosen = items.filter((i) => picked.has(i.id));
    return (
      <div className="mt-8 text-center">
        <div className="text-5xl">✅</div>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-white">Sent, thank you!</h1>
        <p className="mt-2 text-sm text-white/55">
          We&apos;ve got your choices and we&apos;ll get onto them. We&apos;ll be in touch to confirm.
        </p>
        {chosen.length > 0 && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-brand-green/30 bg-brand-green/[0.05] p-4 text-left">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-green">
              You picked
            </div>
            <ul className="mt-2 space-y-1 text-sm text-white/80">
              {chosen.map((c) => (
                <li key={c.id} className="flex justify-between gap-3">
                  <span>{c.title}</span>
                  <span className="font-bold tabular-nums text-brand-green">{money(rate(c.price))}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm font-black text-white">
              <span>Total</span>
              <span className="tabular-nums text-brand-green">{money(total)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
        {vehicle ? `Your ${vehicle}` : "Your vehicle"}
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
        {customerName ? `${customerName.split(" ")[0]}, ` : ""}here&apos;s what we&apos;d{" "}
        <span className="text-brand-green">recommend</span>
      </h1>
      <p className="mt-3 text-sm text-white/55">
        While your car&apos;s with us we spotted a few things we can sort. Tick the ones you want and
        send it back, no pressure, only what you&apos;re happy with.
      </p>

      {member && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-green/30 bg-brand-green/[0.06] px-4 py-2.5 text-sm font-bold text-brand-green">
          🎁 As a member, you get 10% off every upgrade below.
        </div>
      )}

      {!member && (
        <a
          href="/membership"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-brand-green/30 bg-brand-green/[0.06] px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-brand-green/[0.12]"
        >
          <span>🎁 <b className="text-brand-green">Members get 10% off.</b> Not a member? Join for as little as $1.</span>
          <span className="shrink-0 font-black text-brand-green">Join →</span>
        </a>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {items.map((it) => {
          const on = picked.has(it.id);
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => toggle(it.id)}
              className={`overflow-hidden rounded-2xl border text-left transition ${
                on ? "border-brand-green/60 bg-brand-green/[0.06]" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {it.photos.length > 0 && (
                <div className="flex gap-1 overflow-x-auto bg-black/30 p-1">
                  {it.photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={p} alt="" className="h-40 flex-1 rounded-lg object-cover" style={{ minWidth: it.photos.length > 1 ? "60%" : "100%" }} />
                  ))}
                </div>
              )}
              <div className="flex items-start gap-3 p-4">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-sm transition ${
                    on ? "border-brand-green bg-brand-green text-[#04130a]" : "border-white/25 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-lg font-extrabold tracking-tight text-white">
                      {it.title}
                    </span>
                    {member ? (
                      <span className="flex shrink-0 flex-col items-end leading-tight">
                        <span className="text-xs font-semibold tabular-nums text-white/35 line-through">{money(it.price)}</span>
                        <span className="font-display text-lg font-extrabold tabular-nums text-brand-green">{money(rate(it.price))}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wide text-brand-green/70">Members rate</span>
                      </span>
                    ) : (
                      <span className="shrink-0 font-display text-lg font-extrabold tabular-nums text-brand-green">
                        {money(it.price)}
                      </span>
                    )}
                  </div>
                  {it.description && <p className="mt-1 text-sm text-white/60">{it.description}</p>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Any questions or notes for us? (optional)"
        className="mt-4 w-full resize-y rounded-xl border border-white/12 bg-black/40 px-3 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green"
      />

      {err && <div className="mt-3 text-sm font-semibold text-red-300">{err}</div>}

      {!member && total > 0 && (
        <a
          href="/membership"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block rounded-2xl border border-brand-green/40 bg-brand-green/[0.07] p-4 text-center transition hover:bg-brand-green/[0.12]"
        >
          <div className="text-sm leading-relaxed text-white/85">
            Join as a member today and you&apos;d save{" "}
            <b className="text-brand-green">{money(total * (1 - MEMBER_RATE))}</b> on this (10% off), plus go in every members&apos; draw.
          </div>
          <div className="mt-1.5 text-xs font-black uppercase tracking-wide text-brand-green">
            Join for as little as $1 →
          </div>
        </a>
      )}

      {/* sticky-ish action bar */}
      <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
            {picked.size} selected
          </div>
          <div className="font-display text-2xl font-extrabold tabular-nums text-white">
            {money(total)}
          </div>
        </div>
        <button
          onClick={send}
          disabled={state === "sending"}
          className="rounded-full bg-brand-green px-7 py-3.5 text-sm font-black text-[#04130a] shadow-[0_10px_30px_rgba(43,255,122,0.25)] transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {state === "sending" ? "Sending…" : picked.size ? "Send my choices →" : "Send"}
        </button>
      </div>
    </div>
  );
}
