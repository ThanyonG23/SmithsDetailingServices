import type { Metadata } from "next";
import { BUSINESS } from "@/lib/config";
import FullSuiteChoice from "@/components/FullSuiteChoice";

/* Partner choice / upsell page: Platinum vs Full Suite, side by side, with real
   Stripe buy buttons. Both plans' success URL should be /partners/welcome.
   A DRAFT, not yet wired into the funnel; noindex. */

export const metadata: Metadata = {
  title: "Platinum or Full Suite · Smiths",
  robots: { index: false, follow: false },
};

const PLAT_MONTHLY = "https://buy.stripe.com/cNifZh1bGaTXfHa7lV6kg0J";
const PLAT_ANNUAL = "https://buy.stripe.com/6oU00j9Ic0fjamQbCb6kg0K";
const SUITE_MONTHLY = "https://buy.stripe.com/7sYfZhf2w2nramQ21B6kg0L";
const SUITE_ANNUAL = "https://buy.stripe.com/eVq5kD8E8fad0MgdKj6kg0M";

export default function FullSuitePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-8 h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 pb-20 pt-14 sm:pt-20">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">One quick choice</div>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
              Want us to run paid ads against{" "}
              <span className="text-brand-purple-soft">your best content?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/65">
              Content gets you seen and builds trust. Ads get you customers today.
            </p>
          </div>

          <FullSuiteChoice
            platMonthly={PLAT_MONTHLY}
            platAnnual={PLAT_ANNUAL}
            suiteMonthly={SUITE_MONTHLY}
            suiteAnnual={SUITE_ANNUAL}
          />

          <p className="mx-auto mt-6 max-w-md text-center text-[11px] leading-relaxed text-white/45">
            No lock-in contracts, cancel any time. Questions first?{" "}
            <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-brand-purple-soft underline underline-offset-4 transition hover:text-white">
              Call Thanyon
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
