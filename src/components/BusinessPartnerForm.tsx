"use client";

import { useState } from "react";

/* Inbound partnership enquiry form for local businesses. Posts to /api/waitlist
   tagged source="business-partner" so leads land in the ops dashboard and email
   the shop. Business name + interest are packed into the message field. */

const INTERESTS = [
  "Feature my business as a giveaway prize",
  "Offer a discount to Smiths members",
  "Both / not sure yet",
];

export default function BusinessPartnerForm() {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [contact, setContact] = useState("");
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Add your name.");
    if (!business.trim()) return setError("Add your business name.");
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
          source: "business-partner",
          message: `Business: ${business}\nInterested in: ${interest}${message.trim() ? `\n\n${message.trim()}` : ""}`,
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
        <div className="mt-2 font-display text-lg font-extrabold text-white">Got it, thanks</div>
        <p className="mt-1 text-sm text-white/60">Thanyon will be in touch shortly to chat it through.</p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-purple-soft">Get in touch</div>
      <h3 className="mt-1.5 font-display text-xl font-extrabold text-white">Let&apos;s talk partnership</h3>
      <p className="mt-1.5 text-sm text-white/55">Drop your details and Thanyon will reach out. No obligation.</p>
      <div className="mt-4 flex flex-col gap-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
        <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name" className={field} />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or mobile" className={field} />
        <select value={interest} onChange={(e) => setInterest(e.target.value)} className={field}>
          {INTERESTS.map((i) => (
            <option key={i} value={i} className="bg-[#0a0a0a]">
              {i}
            </option>
          ))}
        </select>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything you'd like us to know (optional)"
          rows={3}
          className={`${field} resize-none`}
        />
        <button
          onClick={submit}
          disabled={state === "sending"}
          className="rounded-full bg-brand-purple px-6 py-3 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {state === "sending" ? "Sending…" : "Send enquiry →"}
        </button>
        {error && <div className="text-xs font-semibold text-red-300">{error}</div>}
      </div>
    </div>
  );
}
