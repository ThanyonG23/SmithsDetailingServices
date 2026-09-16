"use client";

import { useState } from "react";

/* Inbound enquiry form for the growth-partner service (/grow). Posts to
   /api/waitlist tagged source="growth-partner" so leads land in the ops
   dashboard and email the shop. Short on purpose to maximise conversion. */

export default function GrowthLeadForm({ source = "growth-partner" }: { source?: string }) {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [trade, setTrade] = useState("");
  const [contact, setContact] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Add your name.");
    if (!contact.trim()) return setError("Add an email or mobile so we can reach you.");
    const isEmail = contact.includes("@");
    setState("sending");
    try {
      const lines = [
        "GROWTH PARTNER enquiry",
        business.trim() && `Business: ${business.trim()}`,
        trade.trim() && `Trade: ${trade.trim()}`,
        suburb.trim() && `Area: ${suburb.trim()}`,
      ].filter(Boolean);
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
          message: lines.join("\n"),
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
        <div className="text-3xl">✅</div>
        <div className="mt-2 font-display text-lg font-extrabold text-white">Got it, thanks</div>
        <p className="mt-1 text-sm text-white/60">
          Thanyon will call you shortly to walk you through exactly how it works. No pressure, no hard sell.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple";

  return (
    <div className="rounded-2xl border border-brand-purple/30 bg-white/[0.02] p-6 sm:p-7">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-purple-soft">Get started</div>
      <h3 className="mt-1.5 font-display text-xl font-extrabold text-white sm:text-2xl">
        Fill out your info and I&apos;ll give you a call
      </h3>
      <p className="mt-1.5 text-sm text-white/55">No obligation, takes 20 seconds. I&apos;ll explain exactly how it works.</p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
        <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name" className={field} />
        <input value={trade} onChange={(e) => setTrade(e.target.value)} placeholder="What do you do? (e.g. mowing)" className={field} />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or mobile" className={field} />
        <input value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="Suburb / area (optional)" className={`${field} sm:col-span-2`} />
      </div>

      <button
        onClick={submit}
        disabled={state === "sending"}
        className="mt-3 w-full rounded-full bg-brand-purple px-6 py-3.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Book my call →"}
      </button>
      {error && <div className="mt-2 text-xs font-semibold text-red-300">{error}</div>}
      <p className="mt-2.5 text-center text-[11px] text-white/40">No upfront cost. You only pay a small cut of jobs we book you.</p>
    </div>
  );
}
