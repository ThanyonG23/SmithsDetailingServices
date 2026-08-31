"use client";

import { useState } from "react";

/* Founding-member waitlist for the Garage Club. Posts to /api/waitlist tagged
   source="garage-club" so leads land in the ops dashboard. */
export default function ClubhouseWaitlist() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
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
          membership: true,
          source: "garage-club",
          interests: ["clubhouse"],
          message: "Garage Club founding waitlist",
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
      <div className="rounded-2xl border border-brand-purple/40 bg-brand-purple/[0.08] p-6 text-center">
        <div className="text-3xl">✅</div>
        <div className="mt-2 font-display text-lg font-extrabold text-white">You&apos;re on the list</div>
        <p className="mt-1 text-sm text-white/55">We&apos;ll message you the moment the Garage Club opens.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center sm:p-6">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-purple-soft">Opening soon</div>
      <h3 className="mt-1.5 font-display text-xl font-extrabold text-white">Get on the founding waitlist</h3>
      <p className="mt-1.5 text-sm text-white/55">Be first in when the doors open, and lock in founding-member pricing.</p>
      <div className="mx-auto mt-4 flex max-w-md flex-col gap-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple"
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email or mobile"
          className="w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple"
        />
        <button
          onClick={submit}
          disabled={state === "sending"}
          className="rounded-full bg-brand-purple px-6 py-3 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {state === "sending" ? "Joining…" : "Join the waitlist →"}
        </button>
        {error && <div className="text-xs font-semibold text-red-300">{error}</div>}
      </div>
    </div>
  );
}
