"use client";

import { useState } from "react";

/* Platinum vs Full Suite choice cards with a shared Monthly/Yearly toggle that
   swaps both the displayed price and the Stripe checkout link on each card. */

type Props = {
  platMonthly: string;
  platAnnual: string;
  suiteMonthly: string;
  suiteAnnual: string;
};

export default function FullSuiteChoice({ platMonthly, platAnnual, suiteMonthly, suiteAnnual }: Props) {
  const [yearly, setYearly] = useState(false);
  const platLink = yearly ? platAnnual : platMonthly;
  const suiteLink = yearly ? suiteAnnual : suiteMonthly;

  return (
    <>
      {/* shared toggle */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-full border border-white/15 bg-black/30 p-1 text-[11px] font-black uppercase tracking-[0.1em]">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={`rounded-full px-5 py-1.5 transition ${
              !yearly ? "bg-brand-purple text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={`rounded-full px-5 py-1.5 transition ${
              yearly ? "bg-brand-purple text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="mt-6 grid items-stretch gap-5 sm:grid-cols-2">
        {/* Platinum */}
        <div className="flex h-full flex-col rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Platinum</div>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-4xl font-black text-white">{yearly ? "$15,000" : "$1,500"}</span>
            <span className="mb-1.5 text-xs font-bold text-white/50">{yearly ? "/year" : "/month"}</span>
          </div>
          <div className="mt-1 flex min-h-[1.25rem] flex-wrap items-center gap-2 text-xs text-white/45">
            {yearly && (
              <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-green">
                Save $3,000
              </span>
            )}
          </div>
          <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
            <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>A full content day at your business every month</li>
            <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>Posted across our socials every week</li>
            <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>A personalised batch sent to you to post</li>
            <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>Featured in our giveaways + backlinks to you</li>
          </ul>
          <a
            href={platLink}
            className="mt-6 flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 font-display text-sm font-black text-brand-ink transition hover:brightness-95 active:scale-95"
          >
            {yearly ? "Platinum · $15,000/yr →" : "Platinum · $1,500/mo →"}
          </a>
        </div>

        {/* Full Suite (recommended) */}
        <div className="relative flex h-full flex-col rounded-3xl border border-brand-purple/50 bg-gradient-to-b from-brand-purple/[0.16] to-white/[0.02] p-6 shadow-[0_0_44px_-12px_rgba(124,47,245,0.8)]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-purple px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
            The full machine
          </span>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-purple-soft">Full Suite</div>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-4xl font-black text-white">{yearly ? "$20,000" : "$2,000"}</span>
            <span className="mb-1.5 text-xs font-bold text-white/50">{yearly ? "/year" : "/month"}</span>
          </div>
          <div className="mt-1 flex min-h-[1.25rem] flex-wrap items-center gap-2 text-xs text-white/45">
            {yearly && (
              <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-green">
                Save $4,000
              </span>
            )}
          </div>
          <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/85">
            <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">★</span><b className="text-white">Everything in Platinum</b></li>
            <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">★</span>We run your socials too, done for you</li>
            <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">★</span>Paid ads run against your best content, actual customers</li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 text-brand-purple-soft">★</span>
              <span>
                We build out your offer with you
                <span className="mt-0.5 block text-xs font-semibold text-white/55">Attraction, upsell, downsell and cross-sell offers</span>
              </span>
            </li>
            <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">🎁</span><span className="text-brand-green">Bonus: a free website (valued at $2,500)</span></li>
          </ul>
          <div className="mt-4 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-green">Our guarantee</div>
            <div className="mt-1 text-sm font-bold leading-relaxed text-white">
              Don&apos;t make back your $2,000 and we&apos;ll work for free until you do.
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[11px] leading-relaxed text-white/50">
            Requires a minimum <b className="text-white/70">$300/week ad budget</b>, that&apos;s your spend, you control it.
          </div>
          <a
            href={suiteLink}
            className="mt-4 flex w-full items-center justify-center rounded-full bg-brand-purple px-6 py-3.5 font-display text-sm font-black text-white shadow-[0_0_44px_-12px_rgba(124,47,245,0.8)] transition hover:brightness-110 active:scale-95"
          >
            {yearly ? "Full Suite · $20,000/yr →" : "Full Suite · $2,000/mo →"}
          </a>
        </div>
      </div>
    </>
  );
}
