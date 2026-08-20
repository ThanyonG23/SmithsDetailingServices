"use client";

import { useState } from "react";

/* ──────────────────────────────────────────────────────────────────────
   MEMBERSHIP TIERS — one product card per vehicle size.
   Each has its own Stripe Payment Link (sign-up first-service fee +
   ongoing weekly subscription baked into the link).
   ────────────────────────────────────────────────────────────────────── */
type Tier = {
  key: string;
  emoji: string;
  desc: string;
  weekly: number; // ongoing $/week
  first: number; // first-visit (sign-up) price — detail + first service
  link: string; // Stripe payment link
};

const TIERS: Tier[] = [
  {
    key: "Single Cab",
    emoji: "🛻",
    desc: "Single cabs & small utes",
    weekly: 39,
    first: 630,
    link: "https://buy.stripe.com/5kQ7sL9Ic6DH8eIbCb6kg0v",
  },
  {
    key: "Sedan / Dual Cab",
    emoji: "🚗",
    desc: "Sedans, hatches & dual cabs",
    weekly: 49,
    first: 680,
    link: "https://buy.stripe.com/fZu3cv1bG0fj2Uo21B6kg0w",
  },
  {
    key: "SUV",
    emoji: "🚙",
    desc: "SUVs & wagons",
    weekly: 59,
    first: 730,
    link: "https://buy.stripe.com/fZu14n7A45zDdz2bCb6kg0x",
  },
  {
    key: "7 Seater",
    emoji: "🚐",
    desc: "7-seaters & people movers",
    weekly: 69,
    first: 780,
    link: "https://buy.stripe.com/4gM00j7A43rv2Uo8pZ6kg0y",
  },
];

/* Post-call sign-up. The pitch + price happen on the phone; here the member
   confirms their details (saved to the ops dashboard) then picks their vehicle
   to continue to Stripe for payment. Tagged source="membership-signup". */
export default function MembershipJoin() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [rego, setRego] = useState("");
  const [preferred, setPreferred] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const selectTier = async (tier: Tier) => {
    setError("");
    if (!name.trim()) return setError("Please add your name.");
    if (!phone.trim()) return setError("Please add a phone number so we can confirm your first visit.");
    if (!agreed) return setError("Please tick the box to confirm you're joining.");
    setBusy(tier.key);
    // Save their details to the dashboard first (best-effort — never block payment).
    try {
      await fetch("/api/waitlist", {
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
          message: `Tier: ${tier.key} ($${tier.weekly}/wk, first $${tier.first}) | Rego: ${rego || "—"} | Preferred first visit: ${preferred || "—"} | Agreed to T&Cs: yes`,
        }),
      });
    } catch {
      /* don't block the customer from paying if the save hiccups */
    }
    // Hand off to Stripe.
    window.location.href = tier.link || "#";
  };

  const field =
    "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-brand-green/60 focus:bg-white/[0.05]";
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
          <label className={labelCls}>Vehicle (make & model)</label>
          <input className={field} value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="2019 Toyota Hilux" />
        </div>
        <div>
          <label className={labelCls}>Rego</label>
          <input className={field} value={rego} onChange={(e) => setRego(e.target.value)} placeholder="ABC123" />
        </div>
        <div>
          <label className={labelCls}>Preferred first visit</label>
          <input className={field} value={preferred} onChange={(e) => setPreferred(e.target.value)} placeholder="e.g. this Saturday" />
        </div>
      </div>

      <div
        className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition ${
          agreed ? "border-brand-green/50 bg-brand-green/[0.07]" : "border-white/12 bg-white/[0.02]"
        }`}
      >
        <button
          type="button"
          onClick={() => setAgreed((a) => !a)}
          aria-pressed={agreed}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[11px] transition ${
            agreed ? "border-brand-green bg-brand-green/20 text-brand-green" : "border-white/25 text-transparent hover:border-brand-green/50"
          }`}
        >
          ✓
        </button>
        <label className="cursor-pointer text-sm text-white/80" onClick={() => setAgreed((a) => !a)}>
          I&apos;m joining the Smiths Detailing membership and agree to the{" "}
          <a
            href="/membership/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-brand-green underline underline-offset-2 hover:text-white"
          >
            Terms &amp; Conditions
          </a>
          .
        </label>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-400">{error}</p>}

      {/* Vehicle tiers → Stripe. Horizontal-scrolling product cards. */}
      <div className="mt-7 border-t border-white/10 pt-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
            Choose your vehicle
          </p>
          <p className="text-[11px] font-semibold text-white/30 sm:hidden">Swipe →</p>
        </div>

        <div className="-mx-1 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 [scrollbar-width:thin]">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className="flex w-[80%] shrink-0 snap-start flex-col rounded-2xl border border-white/12 bg-white/[0.03] p-5 transition hover:border-brand-green/40 sm:w-[47%]"
            >
              {/* header — fixed height so descriptions of different lengths still line up */}
              <div className="flex min-h-[3.25rem] items-center gap-2.5">
                <span className="text-3xl leading-none">{tier.emoji}</span>
                <div className="min-w-0">
                  <h4 className="font-display text-xl font-extrabold leading-tight tracking-tight text-white">{tier.key}</h4>
                  <p className="text-xs leading-snug text-white/45">{tier.desc}</p>
                </div>
              </div>

              <ul className="mt-5 flex flex-col gap-2 text-[13px] leading-snug text-white/70">
                <li className="flex items-start gap-2"><span className="mt-px w-4 shrink-0 text-center text-brand-green">✓</span><span>Full detail every 3 months</span></li>
                <li className="flex items-start gap-2"><span className="mt-px w-4 shrink-0 text-center text-brand-green">✓</span><span>Full service every 6 months</span></li>
                <li className="flex items-start gap-2"><span className="mt-px w-4 shrink-0 text-center text-brand-green">✓</span><span>Priority booking, cancel anytime</span></li>
                <li className="flex items-start gap-2"><span className="mt-px w-4 shrink-0 text-center">🎁</span><span className="text-brand-yellow">Free Cut &amp; Polish (next 15 members)</span></li>
              </ul>

              <button
                type="button"
                disabled={!!busy}
                onClick={() => selectTier(tier)}
                className="mt-6 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-green px-5 py-3.5 font-display text-sm font-black text-brand-ink transition hover:brightness-110 active:scale-95 disabled:opacity-60"
              >
                {busy === tier.key ? "Setting up…" : "Choose this →"}
              </button>
            </div>
          ))}
        </div>
        <p className="mt-1 text-center text-xs text-white/35">Secure payment powered by Stripe.</p>
      </div>
    </div>
  );
}
