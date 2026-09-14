import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, REELS } from "@/lib/config";
import Reveal from "@/components/Reveal";
import DetailOfferForm from "@/components/DetailOfferForm";
import Gallery from "@/components/Gallery";
import Reels from "@/components/Reels";
import ReviewsSection from "@/components/ReviewsSection";

/* Split-test variant B: book an interior detail, free exterior wash + engine
   bay. Same layout and proof as /detail-offer so the only variable is the offer
   itself. Form tagged source="interior-offer-lp" for a clean A/B read. Noindex. */

export const metadata: Metadata = {
  title: "Interior Detail + Free Exterior Wash | Smiths Detailing Cairns",
  description:
    "Book an interior detail and get a full exterior wash plus engine bay detail, free. Over $235 in free value. Cairns. If you're not happy, you don't pay.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/interior-offer" },
};

const STACK: { t: string; d: string; free?: boolean }[] = [
  { t: "Full interior detail", d: "Deep interior reset: vacuum, steam, surfaces and glass, done properly." },
  { t: "Full exterior wash, FREE", d: "Valued at $150+. Hand wash, tyre shine, windows and hand dried.", free: true },
  { t: "Engine bay detail, FREE", d: "Valued at $85. Degreased, dressed and detailed.", free: true },
];

function Stars() {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5" style={{ fill: "#FBBC05" }}>
          <path d="M12 2l2.95 6.55 7.05.62-5.32 4.66 1.6 6.92L12 17.77 5.72 20.75l1.6-6.92L2 9.17l7.05-.62z" />
        </svg>
      ))}
    </span>
  );
}

export default function InteriorOfferLanding() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ── Minimal top bar: logo + proof, no nav so there are no exits ── */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-4 sm:flex-row sm:justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-9 w-auto" />
          <div className="flex items-center gap-2 text-sm">
            <Stars />
            <span className="font-bold text-white">100+ 5-star Google reviews</span>
          </div>
        </div>
      </header>

      {/* ── THE OFFER (hero) ── */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[380px] -translate-x-1/2 rounded-full opacity-[0.14] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-purple/40 bg-brand-purple/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-brand-purple-soft">
              Limited booking offer · Cairns
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-white sm:text-5xl">
              Book an interior detail.
              <br />
              <span className="text-brand-purple-soft">We&apos;ll throw in the exterior wash, free.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65">
              A full deep interior reset, then a proper exterior wash on the house, so your car looks brand new inside and
              out.
            </p>
          </Reveal>
        </div>

        <div className="relative mx-auto mt-11 grid max-w-6xl items-start gap-10 px-4 lg:grid-cols-2">
          {/* Left: value stack */}
          <div>
            <Reveal>
              <ul className="flex flex-col gap-3">
                {STACK.map((item) => (
                  <li key={item.t} className="flex items-start gap-3">
                    <span className={`mt-0.5 shrink-0 text-lg ${item.free ? "text-brand-yellow" : "text-brand-purple-soft"}`}>
                      {item.free ? "🎁" : "✓"}
                    </span>
                    <span>
                      <span className={`font-display text-base font-black ${item.free ? "text-brand-yellow" : "text-white"}`}>
                        {item.t}
                      </span>
                      <span className="ml-2 text-sm text-white/55">{item.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-brand-yellow/45 bg-brand-yellow/[0.08] px-5 py-3.5 shadow-glowY">
                <span className="text-xl">🎁</span>
                <span className="font-display text-base font-black uppercase tracking-tight text-brand-yellow sm:text-lg">
                  Total free value: $235+
                </span>
              </div>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 text-sm font-semibold text-white/50">
                We only take a limited number of bookings each week, so we can give every car the time it needs.{" "}
                <span className="font-black text-brand-purple-soft">4 spots left this week!</span>
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-purple/30 bg-brand-purple/[0.06] px-4 py-3">
                <span className="mt-0.5 shrink-0 text-brand-purple-soft">✅</span>
                <span className="text-sm text-white/70">
                  <span className="font-black text-white">100% Satisfaction Guarantee.</span> If you&apos;re not happy with the
                  result, you don&apos;t pay.
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal delay={150}>
            <div id="claim" className="scroll-mt-6">
              <DetailOfferForm
                source="interior-offer-lp"
                offerLabel="Interior detail, free exterior wash + engine bay"
                ctaLabel="Claim my free exterior wash →"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PROOF: before/after sliders ── */}
      <Gallery />

      {/* ── PROOF: reels ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Real results</div>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Straight out of the workshop
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/55">No filters, no stock footage. Real customer cars.</p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-8">
            <Reels reels={REELS} />
          </div>
        </Reveal>
      </section>

      {/* ── PROOF: reviews ── */}
      <ReviewsSection />

      {/* ── FINAL CTA ── */}
      <section className="border-t border-white/10 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl">
              Claim your spot before they&apos;re <span className="text-brand-purple-soft">gone this week.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/60">
              Over $235 in free extras, on top of your interior detail. Drop your details and Thanyon will call you to lock
              it in.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#claim"
                className="inline-flex items-center justify-center rounded-full bg-brand-purple px-8 py-4 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95"
              >
                Claim the offer →
              </a>
              <a
                href={`tel:${BUSINESS.phoneE164}`}
                className="rounded-full border border-white/20 px-7 py-4 text-sm font-bold text-white transition hover:border-white/40"
              >
                Call {BUSINESS.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Minimal footer ── */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BUSINESS.logo} alt={BUSINESS.name} className="mx-auto h-9 w-auto" />
          <p className="mt-4 text-sm text-white/50">{BUSINESS.address}</p>
          <p className="mt-2 text-sm">
            <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-white transition hover:text-brand-purple-soft">
              {BUSINESS.phone}
            </a>
          </p>
          <p className="mt-4 flex justify-center gap-4 text-xs text-white/30">
            <Link href="/terms" className="transition hover:text-white/70">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy" className="transition hover:text-white/70">
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
