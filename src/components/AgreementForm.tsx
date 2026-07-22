"use client";

import { useState } from "react";
import { BUSINESS } from "@/lib/config";
import { AGREEMENT_VERSION } from "@/lib/agreement";

/* Acceptance is captured by sending it from the detailer's own phone —
   their name, the agreement version and a timestamp, off their own number
   or email address. No database to set up, and the record lands in
   Thanyon's inbox where he can keep it with their employment file. */

function buildMessage(name: string): string {
  const now = new Date();
  const stamp = now.toLocaleString("en-AU", {
    timeZone: BUSINESS.tz,
    dateStyle: "full",
    timeStyle: "short",
  });

  return [
    `I, ${name.trim()}, have read and agree to the Smiths Detailing Content & Referral Agreement (${AGREEMENT_VERSION}).`,
    "",
    `Accepted: ${stamp} (Cairns time)`,
  ].join("\n");
}

export default function AgreementForm() {
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);

  const ready = name.trim().length > 1 && agreed;
  const subject = `Content & Referral Agreement accepted — ${name.trim() || "…"}`;

  const mailHref = ready
    ? `mailto:${BUSINESS.email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(buildMessage(name))}`
    : undefined;

  const smsHref = ready
    ? `sms:${BUSINESS.phoneE164}?&body=${encodeURIComponent(buildMessage(name))}`
    : undefined;

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
      <h3 className="font-display text-lg font-extrabold text-white">
        Accept the agreement
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Type your full name, tick the box, then send it. That&apos;s your record and ours
        &mdash; do this before you make the accounts.
      </p>

      <label
        htmlFor="agreement-name"
        className="mt-6 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/40"
      >
        Your full name
      </label>
      <input
        id="agreement-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
        placeholder="e.g. Federica Rossi"
        className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-[15px] text-white placeholder:text-white/25 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
      />

      <div className="mt-5 flex gap-3">
        <input
          id="agreement-tick"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-brand-green"
        />
        <label
          htmlFor="agreement-tick"
          className="cursor-pointer text-[15px] leading-relaxed text-white/70"
        >
          I&apos;ve read the agreement above and I agree to it.
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={mailHref}
          aria-disabled={!ready}
          onClick={(e) => !ready && e.preventDefault()}
          className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition ${
            ready
              ? "bg-brand-green text-[#04130a] hover:brightness-110 active:scale-95"
              : "cursor-not-allowed bg-white/10 text-white/30"
          }`}
        >
          Send by email
        </a>
        <a
          href={smsHref}
          aria-disabled={!ready}
          onClick={(e) => !ready && e.preventDefault()}
          className={`inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-bold transition ${
            ready
              ? "border-white/25 text-white hover:border-white/50"
              : "cursor-not-allowed border-white/10 text-white/25"
          }`}
        >
          Send by text
        </a>
      </div>

      {!ready && (
        <p className="mt-4 text-xs text-white/35">
          Add your name and tick the box to send.
        </p>
      )}
    </div>
  );
}
