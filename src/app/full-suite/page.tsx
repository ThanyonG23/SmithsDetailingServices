import type { Metadata } from "next";
import { BUSINESS } from "@/lib/config";

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
              Content gets you seen. Ads get you customers. Pick your level.
            </p>
          </div>

          <div className="mt-9 grid items-stretch gap-5 sm:grid-cols-2">
            {/* Platinum */}
            <div className="flex h-full flex-col rounded-3xl border border-white/12 bg-white/[0.03] p-6">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Platinum</div>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-display text-4xl font-black text-white">$1,500</span>
                <span className="mb-1.5 text-xs font-bold text-white/50">/month</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/45">
                or $15,000/yr prepaid
                <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-green">Save $3,000</span>
              </div>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>A full content day at your business every month</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>Posted across our socials every week</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>A personalised batch sent to you to post</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>Featured in our giveaways + backlinks to you</li>
              </ul>
              <div className="mt-6 flex flex-col gap-2.5">
                <a href={PLAT_MONTHLY} className="flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 font-display text-sm font-black text-brand-ink transition hover:brightness-95 active:scale-95">
                  Platinum · $1,500/mo →
                </a>
                <a href={PLAT_ANNUAL} className="flex w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 font-display text-xs font-bold text-white/80 transition hover:border-white/45 active:scale-95">
                  Or pay yearly · $15,000
                </a>
              </div>
            </div>

            {/* Full Suite (recommended) */}
            <div className="relative flex h-full flex-col rounded-3xl border border-brand-purple/50 bg-gradient-to-b from-brand-purple/[0.16] to-white/[0.02] p-6 shadow-[0_0_44px_-12px_rgba(124,47,245,0.8)]">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-purple px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                The full machine
              </span>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-purple-soft">Full Suite</div>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-display text-4xl font-black text-white">$2,000</span>
                <span className="mb-1.5 text-xs font-bold text-white/50">/month</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/45">
                or $20,000/yr prepaid
                <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-green">Save $4,000</span>
              </div>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/85">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">★</span><b className="text-white">Everything in Platinum</b></li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">★</span>We run your socials too, done for you</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">★</span>Paid ads run against your best content, actual customers</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">🎁</span><span className="text-brand-green">Bonus: a free website (limited time)</span></li>
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
              <div className="mt-4 flex flex-col gap-2.5">
                <a href={SUITE_MONTHLY} className="flex w-full items-center justify-center rounded-full bg-brand-purple px-6 py-3.5 font-display text-sm font-black text-white shadow-[0_0_44px_-12px_rgba(124,47,245,0.8)] transition hover:brightness-110 active:scale-95">
                  Full Suite · $2,000/mo →
                </a>
                <a href={SUITE_ANNUAL} className="flex w-full items-center justify-center rounded-full border border-brand-purple/50 bg-brand-purple/[0.12] px-6 py-3 font-display text-xs font-bold text-brand-purple-soft transition hover:bg-brand-purple/[0.2] active:scale-95">
                  Or pay yearly · $20,000
                </a>
              </div>
            </div>
          </div>

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
