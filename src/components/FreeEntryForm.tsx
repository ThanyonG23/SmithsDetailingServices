"use client";

import { useState } from "react";

/* No-purchase-necessary free entry into the members' draws. Posts to
   /api/free-entry. This is the legal safety valve: nobody has to pay to enter. */
export default function FreeEntryForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Add your name.");
    if (!contact.trim()) return setError("Add an email or mobile.");
    const isEmail = contact.includes("@");
    setState("sending");
    try {
      const res = await fetch("/api/free-entry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email: isEmail ? contact : "", phone: isEmail ? "" : contact }),
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
        <div className="text-3xl">🎁</div>
        <div className="mt-2 font-display text-lg font-extrabold text-white">You&apos;re entered</div>
        <p className="mt-1.5 text-sm leading-relaxed text-white/60">
          Your free entry into the current members&apos; draw is locked in. Good luck.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex flex-col gap-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or mobile" className={field} />
        <button
          onClick={submit}
          disabled={state === "sending"}
          className="rounded-full bg-brand-purple px-6 py-3 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {state === "sending" ? "Entering…" : "Enter the draw for free →"}
        </button>
        {error && <div className="text-center text-xs font-semibold text-red-300">{error}</div>}
      </div>
    </div>
  );
}
