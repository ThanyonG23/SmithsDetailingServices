import type { Metadata } from "next";
import { BUSINESS } from "@/lib/config";

/* "Full Suite" upsell page for Platinum partners, the next tier up: we also run
   their pages, and take the best content and run paid ads against it. A DRAFT,
   not yet wired into the funnel. Pricing is a call (ads are custom per business).
   Nothing points here yet; noindex. */

export const metadata: Metadata = {
  title: "The Full Suite · Smiths",
  robots: { index: false, follow: false },
};

const GETS = [
  {
    t: "Everything in Platinum",
    d: "A full content day at your business every month, edited and posted across our socials.",
    highlight: false,
  },
  {
    t: "We run your socials too, done for you",
    d: "Give us access and we post to your own pages as well. You never touch it.",
    highlight: false,
  },
  {
    t: "Paid ads run against your best content",
    d: "We take your top-performing pieces, add a call to action, and put real ad spend behind them, the $132,854 skill working for your business. Not just views. Actual customers.",
    highlight: true,
  },
];

export default function FullSuitePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-8 h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl px-5 pb-20 pt-14 sm:pt-20">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">The Full Suite</div>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
              Want us to take your best content and{" "}
              <span className="text-brand-purple-soft">run paid ads against it too?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/65">
              This is where it goes next. We don&apos;t just make and post your content, we find your best-performing
              pieces, add a call to action, and put real ad spend behind them. The full marketing machine, done for you.
            </p>
          </div>

          {/* What you get */}
          <div className="mt-9 rounded-3xl border border-brand-purple/40 bg-gradient-to-b from-brand-purple/[0.12] to-white/[0.02] p-6 shadow-[0_0_60px_-24px_rgba(124,47,245,0.6)] sm:p-8">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-purple-soft">What you get</div>
            <div className="mt-4 flex flex-col gap-3">
              {GETS.map((g) => (
                <div
                  key={g.t}
                  className={`rounded-2xl border p-4 ${
                    g.highlight
                      ? "border-brand-purple/50 bg-brand-purple/[0.12]"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 shrink-0 ${g.highlight ? "text-brand-purple-soft" : "text-brand-green"}`}>
                      {g.highlight ? "★" : "✓"}
                    </span>
                    <div>
                      <div className="font-display text-base font-extrabold text-white">{g.t}</div>
                      <div className="mt-1 text-sm leading-relaxed text-white/65">{g.d}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bonus */}
            <div className="mt-4 rounded-2xl border border-brand-green/40 bg-brand-green/[0.08] p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-lg leading-none">🎁</span>
                <div>
                  <div className="font-display text-base font-extrabold text-brand-green">
                    Bonus: a free website
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-white/70">
                    Built for you, on us. Limited-time deal for Full Suite partners.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-purple px-8 py-4 font-display text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110 active:scale-95"
            >
              Book a call to build your suite →
            </a>
            <p className="mx-auto mt-3 max-w-md text-[11px] leading-relaxed text-white/45">
              Priced per business, because your ad spend and goals are your own. We&apos;ll map it out on a quick call.
              No lock-in, ever.
            </p>
            <p className="mt-4 text-sm text-white/55">
              Prefer to write?{" "}
              <a href="/partners#contact" className="font-bold text-brand-purple-soft underline underline-offset-4 transition hover:text-white">
                Send an enquiry
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
