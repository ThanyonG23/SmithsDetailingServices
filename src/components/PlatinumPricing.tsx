"use client";

import { useState } from "react";

/* Monthly / yearly toggle for the Platinum partner price. Yearly is the cash
   play, so it carries the "Save $3,000" flag when selected. */
export default function PlatinumPricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="mt-4">
      <div className="inline-flex rounded-full border border-white/15 bg-black/30 p-1 text-[11px] font-black uppercase tracking-[0.1em]">
        <button
          type="button"
          onClick={() => setYearly(false)}
          className={`rounded-full px-4 py-1.5 transition ${
            !yearly ? "bg-brand-purple text-white" : "text-white/50 hover:text-white"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setYearly(true)}
          className={`rounded-full px-4 py-1.5 transition ${
            yearly ? "bg-brand-purple text-white" : "text-white/50 hover:text-white"
          }`}
        >
          Yearly
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
        {!yearly ? (
          <>
            <span className="text-xs font-bold text-white/50">from</span>
            <span className="font-display text-4xl font-black text-brand-green">$1,500</span>
            <span className="mb-1 text-xs font-bold text-white/50">/month</span>
          </>
        ) : (
          <>
            <span className="font-display text-4xl font-black text-brand-green">$15,000</span>
            <span className="mb-1 text-xs font-bold text-white/50">/year</span>
            <span className="mb-1 rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-green">
              Save $3,000
            </span>
          </>
        )}
      </div>
    </div>
  );
}
