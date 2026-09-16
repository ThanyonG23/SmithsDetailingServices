"use client";

import { useState } from "react";

/* Simple "accept the offer" form for a personalised proposal page. Posts to
   /api/waitlist tagged with `source` so the acceptance lands in the ops
   dashboard and emails the shop. */

export default function OfferForm({
  source,
  offerLabel,
  ctaLabel = "Lock it in →",
  chooser,
}: {
  source: string;
  offerLabel: string;
  ctaLabel?: string;
  chooser?: { label: string; options: string[] };
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [chosen, setChosen] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Add your name.");
    if (!contact.trim()) return setError("Add an email or mobile so we can reach you.");
    const isEmail = contact.includes("@");
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email: isEmail ? contact : "",
          phone: isEmail ? "" : contact,
          vehicle: "",
          membership: false,
          source,
          message: [`OFFER: ${offerLabel}`, chosen && `Chose: ${chosen}`, note.trim()].filter(Boolean).join("\n"),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.error || "Something went wrong, try again.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Something went wrong, try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand-purple/40 bg-brand-purple/[0.08] p-8 text-center">
        <div className="text-3xl">🎉</div>
        <div className="mt-2 font-display text-lg font-extrabold text-white">You&apos;re locked in</div>
        <p className="mt-1 text-sm text-white/60">
          Thanyon will be in touch to plan it out with you. Let&apos;s fill that bus.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple";

  return (
    <div className="rounded-2xl border border-brand-purple/30 bg-white/[0.02] p-6 sm:p-7">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-purple-soft">Lock it in</div>
      <h3 className="mt-1.5 font-display text-xl font-extrabold text-white sm:text-2xl">Ready to go?</h3>
      <p className="mt-1.5 text-sm text-white/55">Drop your details and we&apos;ll plan it out with you. No obligation.</p>

      {chooser && (
        <select value={chosen} onChange={(e) => setChosen(e.target.value)} className={`${field} mt-5`}>
          <option value="" className="bg-[#0a0a0a]">
            {chooser.label}
          </option>
          {chooser.options.map((o) => (
            <option key={o} value={o} className="bg-[#0a0a0a]">
              {o}
            </option>
          ))}
        </select>
      )}
      <div className={`grid gap-2.5 sm:grid-cols-2 ${chooser ? "mt-2.5" : "mt-5"}`}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or mobile" className={field} />
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Anything you'd like to tweak or ask? (optional)"
        rows={2}
        className={`${field} mt-2.5 resize-none`}
      />

      <button
        onClick={submit}
        disabled={state === "sending"}
        className="mt-3 w-full rounded-full bg-brand-purple px-6 py-3.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : ctaLabel}
      </button>
      {error && <div className="mt-2 text-xs font-semibold text-red-300">{error}</div>}
      <p className="mt-2.5 text-center text-[11px] text-white/40">No cost to you. You just put up the prize.</p>
    </div>
  );
}
