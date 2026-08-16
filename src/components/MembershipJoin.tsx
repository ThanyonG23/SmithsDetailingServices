"use client";

import { useState } from "react";

/* Post-call sign-up form. The pitch + price happen on the phone; this page
   just captures the details to set a new member up. Posts to /api/waitlist
   tagged source="membership-signup" so it shows on the ops dashboard as a
   committed sign-up (green badge), distinct from general interest. */
export default function MembershipJoin() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [rego, setRego] = useState("");
  const [suburb, setSuburb] = useState("");
  const [preferred, setPreferred] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Please add your name.");
    if (!phone.trim()) return setError("Please add a phone number so we can confirm your first visit.");
    if (!vehicle.trim()) return setError("Please add your vehicle.");
    if (!agreed) return setError("Please tick the box to confirm you're joining.");
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          vehicle,
          membership: true,
          source: "membership-signup",
          interests: ["detailing", "servicing"],
          message: `Rego: ${rego || "—"} | Suburb: ${suburb || "—"} | Preferred first visit: ${preferred || "—"} | Agreed to plan: yes`,
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
      <div className="rounded-3xl border border-brand-green/40 bg-brand-green/[0.08] p-8 text-center shadow-glowG">
        <div className="text-4xl">✅</div>
        <h3 className="mt-3 font-display text-2xl font-extrabold text-white">You&apos;re all set, {name.trim().split(" ")[0]}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/70">
          Welcome to the plan. We&apos;ll text you shortly to lock in your first visit.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-brand-purple/60 focus:bg-white/[0.05]";
  const labelCls = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/40";

  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Full name *</label>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Smith" />
        </div>
        <div>
          <label className={labelCls}>Phone *</label>
          <input className={field} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0456 000 000" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div>
          <label className={labelCls}>Vehicle (make & model) *</label>
          <input className={field} value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="2019 Toyota Hilux" />
        </div>
        <div>
          <label className={labelCls}>Rego</label>
          <input className={field} value={rego} onChange={(e) => setRego(e.target.value)} placeholder="ABC123" />
        </div>
        <div>
          <label className={labelCls}>Suburb</label>
          <input className={field} value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="Parramatta Park" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Preferred first visit</label>
          <input className={field} value={preferred} onChange={(e) => setPreferred(e.target.value)} placeholder="e.g. this Saturday, or next week" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAgreed((a) => !a)}
        className={`mt-5 flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
          agreed ? "border-brand-purple/50 bg-brand-purple/[0.07]" : "border-white/12 bg-white/[0.02] hover:border-white/25"
        }`}
      >
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[11px] transition ${
            agreed ? "border-brand-purple bg-brand-purple/20 text-brand-purple-soft" : "border-white/25 text-transparent"
          }`}
        >
          ✓
        </span>
        <span className="text-sm text-white/80">
          I&apos;m joining the Smiths Garage Maintenance plan we discussed, and I understand I can cancel any time.
        </span>
      </button>

      {error && <p className="mt-4 text-sm font-semibold text-red-400">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={state === "sending"}
        className="mt-6 w-full rounded-full bg-brand-purple px-6 py-4 font-display text-base font-extrabold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {state === "sending" ? "Setting you up…" : "Confirm & join →"}
      </button>
    </div>
  );
}
