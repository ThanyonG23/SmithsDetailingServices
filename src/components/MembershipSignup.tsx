"use client";

import { useState } from "react";

/* Single-package membership sign-up. Posts to /api/waitlist tagged
   source="membership-page" + membership=true, so it lands in the same
   ops dashboard waitlist, separated from the general garage waitlist. */
export default function MembershipSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Please add your name.");
    if (!email.trim() && !phone.trim()) return setError("Add an email or phone so we can reach you.");
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name, email, phone, vehicle,
          membership: true,
          source: "membership-page",
          interests: ["detailing", "servicing"],
          message: "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Something went wrong, try again.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Couldn't reach us, check your connection and try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-3xl border border-brand-green/40 bg-brand-green/[0.08] p-8 text-center">
        <div className="text-4xl">🎉</div>
        <h3 className="mt-3 font-display text-2xl font-extrabold text-white">Your founding spot is reserved</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/70">
          Thanks {name.trim().split(" ")[0]}, we&apos;ll call you shortly to lock in your price and book
          your first visit. Keep an eye on your {email.trim() ? "inbox" : "phone"}.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-brand-green/60 focus:bg-white/[0.05]";
  const labelCls = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/40";

  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-6 sm:p-8">
      <h3 className="font-display text-2xl font-extrabold tracking-tight text-white">Reserve your founding spot</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Leave your details and we&apos;ll call you to lock in your price and first visit. No payment now.
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

      {error && <p className="mt-4 text-sm font-semibold text-red-400">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={state === "sending"}
        className="mt-6 w-full rounded-full bg-brand-green px-6 py-4 font-display text-base font-extrabold text-brand-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {state === "sending" ? "Reserving…" : "Reserve my spot →"}
      </button>
      <p className="mt-3 text-center text-xs text-white/35">No payment now. We&apos;ll confirm everything with you first.</p>
    </div>
  );
}
