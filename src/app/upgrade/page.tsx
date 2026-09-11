import type { Metadata } from "next";
import Countdown from "@/components/Countdown";

/* Pre-purchase choice / upsell page. A DRAFT, not yet wired into the funnel.
   Flow: the "Join for $1" buttons point here first; the visitor picks the $1
   membership OR Platinum monthly ($24.99, a much smaller jump than the yearly),
   side by side. Both buttons use real Stripe links. To go live, point the site's
   "Join for $1" buttons at /upgrade. Nothing points here yet; noindex. */

export const metadata: Metadata = {
  title: "Pick your plan · Smiths",
  robots: { index: false, follow: false },
};

const JOIN_1_URL = "https://buy.stripe.com/8x27sL07CaTX8eI35F6kg0z";
// Platinum monthly $24.99 (5 entries every draw) — small step up from the $1 plan.
const PLATINUM_OFFER_URL = "https://buy.stripe.com/9B63cv07C3rv0Mg5dN6kg0F";
// Draw entry cut-offs (keep in sync with the membership page).
const DRAW_TIME = "2026-09-14T12:00:00+10:00";
const DRAW_MINI_TIME = "2026-09-21T12:00:00+10:00";

const PLAT_GLOW = "shadow-[0_0_44px_-12px_rgba(124,47,245,0.7)]";

export default function UpgradePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-8 h-[440px] w-[440px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 pb-20 pt-12 sm:pt-16">
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/media/photos/spend-1000.webp"
              alt="What would you spend $1,000 on this week?"
              width={1600}
              height={800}
              className="mx-auto w-full max-w-2xl rounded-2xl"
            />
            <h1 className="mt-6 font-display text-2xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl">
              This week&apos;s prize is big. <span className="text-brand-purple-soft">What&apos;s coming next is bigger.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/65">
              Want the best odds? <b className="text-brand-purple-soft">Go Platinum for 5x the entries</b> in every draw.
            </p>
          </div>

          <div className="mt-9 grid items-stretch gap-5 sm:grid-cols-2">
            {/* Option A: $1 member */}
            <div className="flex h-full flex-col rounded-3xl border border-white/12 bg-white/[0.03] p-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">Smiths Member</div>
              <div className="mt-3 flex items-end gap-2">
                <span className="mb-1.5 font-display text-lg font-bold text-red-400 line-through">$9.99</span>
                <span className="font-display text-4xl font-black text-white">$1</span>
                <span className="mb-1.5 text-xs font-bold text-white/50">first month</span>
              </div>
              <div className="mt-1 text-xs text-white/45">then $9.99/month · cancel anytime</div>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">🎁</span>1 entry into every draw</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>10% off all detailing</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>Priority booking</li>
              </ul>
              <a
                href={JOIN_1_URL}
                className="mt-6 flex w-full items-center justify-center rounded-full border border-white/20 px-6 py-3.5 font-display text-sm font-black text-white transition hover:border-white/50 active:scale-95"
              >
                Join for $1 →
              </a>
            </div>

            {/* Option B: Platinum monthly (recommended, small step up from $1) */}
            <div className={`relative flex h-full flex-col rounded-3xl border border-brand-purple/50 bg-gradient-to-b from-brand-purple/[0.16] to-white/[0.02] p-6 ${PLAT_GLOW}`}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-purple px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                Best odds · most popular
              </span>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-purple-soft">Platinum · monthly</div>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-display text-4xl font-black text-white">$24.99</span>
                <span className="mb-1.5 text-xs font-bold text-white/50">/month</span>
              </div>
              <div className="mt-1 text-xs text-white/45">5x the entries · cancel anytime</div>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/85">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">🎁</span><b className="text-white">5 entries into every draw</b></li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>20% off all detailing</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>Priority access to everything</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>Cancel anytime, no lock-in</li>
              </ul>
              <a
                href={PLATINUM_OFFER_URL}
                className={`mt-6 flex w-full items-center justify-center rounded-full bg-brand-purple px-6 py-3.5 font-display text-sm font-black text-white ${PLAT_GLOW} transition hover:brightness-110 active:scale-95`}
              >
                Go Platinum · $24.99/mo →
              </a>
            </div>
          </div>

          {/* Posters: what the extra entries are for */}
          <div className="mt-12">
            <h2 className="text-center font-display text-xl font-extrabold leading-tight tracking-tight text-white sm:text-2xl">
              Get <span className="text-brand-purple-soft">5 entries instead of 1</span> into these draws
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {[
                { poster: "/media/photos/giveaway.jpg", label: "Big draw · 14 Sept", prize: "Win $1,000 cash or a $2,200 detail", target: DRAW_TIME, alt: "Smiths big draw, win $1,000 cash or a $2,200 detail" },
                { poster: "/media/photos/mini-giveaway.jpg", label: "Mini draw · 21 Sept", prize: "Win $300 cash or a $400+ detail", target: DRAW_MINI_TIME, alt: "Smiths mini draw, win $300 cash or a $400+ detail" },
              ].map((d) => (
                <div
                  key={d.label}
                  className="overflow-hidden rounded-2xl border border-brand-purple/40 shadow-[0_0_0_1px_rgba(124,47,245,0.2),0_0_45px_rgba(124,47,245,0.28)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.poster} alt={d.alt} className="aspect-[16/9] w-full object-cover" />
                  <div className="bg-gradient-to-br from-brand-purple/[0.16] to-brand-purple/[0.02] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">{d.label}</div>
                    <div className="mt-1 font-display text-base font-extrabold text-white">{d.prize}</div>
                    <div className="mb-1.5 mt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-red-400">Draw closes in</div>
                    <Countdown target={d.target} accent="red" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-md text-center text-[11px] leading-relaxed text-white/40">
            Cancel anytime, no lock-in. Both plans put you straight into this week&apos;s draw.
          </p>
        </div>
      </div>
    </main>
  );
}
