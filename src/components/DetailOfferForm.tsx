"use client";

import { useState } from "react";

/* Attraction-offer enquiry form for the detailing page. Posts to /api/waitlist
   tagged source="detailing-offer" so leads land in the ops dashboard and email
   the shop. Kept deliberately short (name, contact, vehicle) to maximise the
   conversion rate, everything else gets sorted on the quote call. */

export default function DetailOfferForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Add your name.");
    if (!contact.trim()) return setError("Add an email or mobile so we can reach you.");
    if (!vehicle.trim()) return setError("Let us know your vehicle so we can quote it.");
    const isEmail = contact.includes("@");
    setState("sending");
    try {
      const lines = [
        "OFFER: Exterior detail + multi-stage cut & polish, free interior detail",
        `Vehicle: ${vehicle.trim()}`,
        suburb.trim() && `Area: ${suburb.trim()}`,
      ].filter(Boolean);
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email: isEmail ? contact : "",
          phone: isEmail ? "" : contact,
          vehicle: vehicle.trim(),
          membership: false,
          source: "detailing-offer",
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
      <div className="rounded-2xl border border-brand-green/40 bg-brand-green/[0.08] p-8 text-center">
        <div className="text-3xl">✅</div>
        <div className="mt-2 font-display text-lg font-extrabold text-white">You&apos;re in, thanks</div>
        <p className="mt-1 text-sm text-white/60">
          Thanyon will text you back shortly with your price and a time. Your free interior detail is locked in.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green";

  return (
    <div className="rounded-2xl border border-brand-green/30 bg-white/[0.02] p-6 sm:p-7">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-green">Claim the offer</div>
      <h3 className="mt-1.5 font-display text-xl font-extrabold text-white sm:text-2xl">
        Book your spot, get the interior free
      </h3>
      <p className="mt-1.5 text-sm text-white/55">
        Drop your details and Thanyon will text you your price and a time. No obligation, takes 20 seconds.
      </p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or mobile" className={field} />
        <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="Your vehicle (e.g. 2019 Ranger)" className={field} />
        <input value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="Suburb (optional)" className={field} />
      </div>

      <button
        onClick={submit}
        disabled={state === "sending"}
        className="mt-3 w-full rounded-full bg-brand-green px-6 py-3.5 font-display text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95 disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Claim my free interior detail →"}
      </button>
      {error && <div className="mt-2 text-xs font-semibold text-red-300">{error}</div>}
      <p className="mt-2.5 text-center text-[11px] text-white/40">
        If you&apos;re not happy with the result, you don&apos;t pay.
      </p>
    </div>
  );
}
