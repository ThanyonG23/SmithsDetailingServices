"use client";

import { useState } from "react";

/* Onboarding intake form for a growth-partner proposal (a business that has
   already said yes on the phone). Collects what we need to start, plus their
   preferred commission model for regular work. Posts to /api/waitlist tagged
   with `source` so it lands in the ops dashboard and emails the shop. */

const REGULAR_OPTIONS = [
  "100% of the first clean, then I keep the client",
  "20% recurring from every clean",
  "Not sure yet, let's discuss on the call",
];

export default function GrowthProposalForm({ source, businessDefault = "" }: { source: string; businessDefault?: string }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [business, setBusiness] = useState(businessDefault);
  const [services, setServices] = useState("");
  const [area, setArea] = useState("");
  const [socials, setSocials] = useState("");
  const [website, setWebsite] = useState("");
  const [pricing, setPricing] = useState("");
  const [capacity, setCapacity] = useState("");
  const [regular, setRegular] = useState("");
  const [notes, setNotes] = useState("");
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
        "GROWTH PROPOSAL, accepted",
        business.trim() && `Business: ${business.trim()}`,
        services.trim() && `Services: ${services.trim()}`,
        area.trim() && `Location / area: ${area.trim()}`,
        socials.trim() && `Socials: ${socials.trim()}`,
        website.trim() && `Website: ${website.trim()}`,
        pricing.trim() && `Current pricing: ${pricing.trim()}`,
        capacity.trim() && `Capacity: ${capacity.trim()}`,
        regular && `Regular-clean commission preference: ${regular}`,
        notes.trim() && `Notes: ${notes.trim()}`,
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
        <div className="mt-2 font-display text-lg font-extrabold text-white">Got everything, thanks</div>
        <p className="mt-1 text-sm text-white/60">Thanyon will be in touch to lock the details and get you started.</p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple";
  const label = "text-[11px] font-bold uppercase tracking-wider text-white/45";

  return (
    <div className="rounded-2xl border border-brand-purple/30 bg-white/[0.02] p-6 sm:p-7">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-purple-soft">Let's get started</div>
      <h3 className="mt-1.5 font-display text-xl font-extrabold text-white sm:text-2xl">Send us your details</h3>
      <p className="mt-1.5 text-sm text-white/55">The more you tell us, the faster we can get your engine running.</p>

      <div className="mt-5 flex flex-col gap-2.5">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or mobile" className={field} />
        </div>
        <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name" className={field} />
        <textarea value={services} onChange={(e) => setServices(e.target.value)} placeholder="What services do you offer? (e.g. regular home cleans, bond cleans, deep cleans, commercial)" rows={2} className={`${field} resize-none`} />
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Your location / service area (suburbs)" className={field} />
        <input value={socials} onChange={(e) => setSocials(e.target.value)} placeholder="Your social media accounts (Instagram, Facebook, TikTok)" className={field} />
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website (if you have one)" className={field} />
        <input value={pricing} onChange={(e) => setPricing(e.target.value)} placeholder="Your rough pricing (e.g. $X per regular clean, $Y bond clean)" className={field} />
        <input value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="How many jobs can you take on per week?" className={field} />

        <div className="mt-1">
          <div className={label}>For regular cleans, which suits you?</div>
          <select value={regular} onChange={(e) => setRegular(e.target.value)} className={`${field} mt-1.5`}>
            <option value="" className="bg-[#0a0a0a]">Choose an option</option>
            {REGULAR_OPTIONS.map((o) => (
              <option key={o} value={o} className="bg-[#0a0a0a]">
                {o}
              </option>
            ))}
          </select>
        </div>

        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else we should know? (optional)" rows={2} className={`${field} mt-1 resize-none`} />
      </div>

      <button
        onClick={submit}
        disabled={state === "sending"}
        className="mt-4 w-full rounded-full bg-brand-purple px-6 py-3.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Send my details →"}
      </button>
      {error && <div className="mt-2 text-xs font-semibold text-red-300">{error}</div>}
      <p className="mt-2.5 text-center text-[11px] text-white/40">No upfront cost. You only pay a cut of the work we bring you.</p>
    </div>
  );
}
