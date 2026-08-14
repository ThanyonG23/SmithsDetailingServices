"use client";

import { useState } from "react";
import { GARAGE_SERVICES, MEMBERSHIP_NAME } from "@/lib/garage";

/* The Smiths Garage waitlist sign-up. Posts to /api/waitlist, which stores it
   in Supabase (the same DB the ops manager reads) and emails the shop inbox. */
export default function GarageWaitlist() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [message, setMessage] = useState("");
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [membership, setMembership] = useState(true);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const toggle = (id: string) => {
    const next = new Set(interests);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setInterests(next);
  };

  const submit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please add your name.");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setError("Add an email or phone so we can reach you.");
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          vehicle,
          message,
          membership,
          interests: [...interests],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Something went wrong — try again.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Couldn't reach us — check your connection and try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-3xl border border-brand-purple/40 bg-brand-purple/[0.08] p-8 text-center">
        <div className="text-4xl">🎉</div>
        <h3 className="mt-3 font-display text-2xl font-extrabold text-white">You&apos;re on the list</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/70">
          Thanks {name.trim().split(" ")[0]}. We&apos;ll be in touch the moment Smiths Garage opens
          {membership ? " — and you'll get first dibs on a membership spot" : ""}. Keep an eye on your
          {email.trim() ? " inbox" : " phone"}.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-brand-purple/60 focus:bg-white/[0.05]";
  const labelCls = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/40";

  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-6 sm:p-8">
      <h3 className="font-display text-2xl font-extrabold tracking-tight text-white">
        Join the waitlist
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Be first to know when we open — and lock in early access to the {MEMBERSHIP_NAME}.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Your name *</label>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Smith" />
        </div>
        <div>
          <label className={labelCls}>Vehicle</label>
          <input className={field} value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="2019 Hilux" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input className={field} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0456 000 000" />
        </div>
      </div>

      <div className="mt-6">
        <label className={labelCls}>What are you interested in?</label>
        <div className="flex flex-wrap gap-2">
          {GARAGE_SERVICES.map((s) => {
            const on = interests.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                  on
                    ? "border-brand-purple bg-brand-purple/20 text-white"
                    : "border-white/15 text-white/60 hover:border-white/35 hover:text-white/80"
                }`}
              >
                {s.icon} {s.name}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMembership((m) => !m)}
        className={`mt-5 flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
          membership
            ? "border-brand-yellow/50 bg-brand-yellow/[0.07] shadow-glowY"
            : "border-white/12 bg-white/[0.02] hover:border-white/25"
        }`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-sm transition ${
            membership ? "border-brand-yellow bg-brand-yellow/20 text-brand-yellow" : "border-white/25 text-transparent"
          }`}
        >
          ✓
        </span>
        <span className="text-sm">
          <span className="font-bold text-white">Yes — I want a {MEMBERSHIP_NAME} spot.</span>
          <span className="block text-white/55">Detailed &amp; serviced every 3 months, priority booking, one monthly payment.</span>
        </span>
      </button>

      <div className="mt-5">
        <label className={labelCls}>Anything else? (optional)</label>
        <textarea
          className={`${field} min-h-[80px] resize-y`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you're after…"
        />
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-400">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={state === "sending"}
        className="mt-6 w-full rounded-full bg-brand-purple px-6 py-4 font-display text-base font-extrabold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {state === "sending" ? "Adding you…" : "Join the waitlist →"}
      </button>
      <p className="mt-3 text-center text-xs text-white/35">No spam. We&apos;ll only message you about the launch.</p>
    </div>
  );
}
