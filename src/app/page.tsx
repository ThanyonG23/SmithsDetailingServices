import Link from "next/link";
import {
  BUSINESS,
  REELS,
  SERVICES,
  TEXT_TO_BOOK_HREF,
  HERO_IMAGE,
  CTA_IMAGE,
} from "@/lib/config";
import Reels from "@/components/Reels";
import ReviewsSection from "@/components/ReviewsSection";
import ServiceShowcase from "@/components/ServiceShowcase";
import BringBlackBack from "@/components/BringBlackBack";
import Gallery from "@/components/Gallery";
import Reveal from "@/components/Reveal";

function TextCta({ className = "" }: { className?: string }) {
  return (
    <a
      href={TEXT_TO_BOOK_HREF}
      className={`inline-flex items-center justify-center rounded-full bg-brand-green px-7 py-4 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95 ${className}`}
    >
      Text for a Free Quote →
    </a>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
      {children}
    </div>
  );
}

function Stars({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5" style={{ fill: "#FBBC05" }}>
          <path d="M12 2l2.95 6.55 7.05.62-5.32 4.66 1.6 6.92L12 17.77 5.72 20.75l1.6-6.92L2 9.17l7.05-.62z" />
        </svg>
      ))}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ═══════════════════ NAV ═══════════════════ */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center" aria-label="Smiths Detailing home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-10 w-auto sm:h-11" />
          </Link>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="hidden text-sm font-bold text-white/70 transition hover:text-white sm:block"
            >
              {BUSINESS.phone}
            </a>
            <a
              href={TEXT_TO_BOOK_HREF}
              className="rounded-full bg-brand-green px-4 py-2 text-xs font-black text-[#04130a] transition hover:brightness-110"
            >
              Free Quote
            </a>
          </div>
        </div>
      </header>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative flex min-h-[86vh] items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover"
          // focal point pushed right so mobile crops to the car's front + the shopfront sign
          style={{ backgroundImage: `url(${HERO_IMAGE})`, backgroundPosition: "80% center" }}
          aria-hidden
        />
        {/* legibility layers */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/45 to-black/10"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050506] to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-32 sm:pb-24">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
              📍 {BUSINESS.suburb}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Premium car
              <br />
              detailing in{" "}
              <span className="text-brand-yellow">Cairns.</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-7 max-w-md text-base leading-relaxed text-white/70">
              From a deep interior reset to full paint correction and ceramic coatings, done
              properly at our {BUSINESS.suburb} workshop.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <TextCta />
              <a
                href={`tel:${BUSINESS.phoneE164}`}
                className="rounded-full border border-white/20 px-7 py-4 text-sm font-bold text-white transition hover:border-white/40"
              >
                Call {BUSINESS.phone}
              </a>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-8 flex items-center gap-2.5 text-sm text-white/60">
              <Stars />
              <span className="font-bold text-white">100+ 5-Star Google reviews</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ TRUST STRIP ═══════════════════ */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 md:grid-cols-4">
          {[
            { big: "100+", small: "5-star Google reviews" },
            { big: "7", small: "Detailing services" },
            { big: "100%", small: "Satisfaction guarantee" },
            { big: "Cairns", small: BUSINESS.suburb },
          ].map((item) => (
            <div key={item.small} className="py-7 text-center">
              <div className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                {item.big}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/45">
                {item.small}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ SERVICES ═══════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto mb-20 max-w-6xl px-4">
          <Reveal>
            <Eyebrow>What we do</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Everything your car needs,
              <span className="text-brand-green"> under one roof.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
              {SERVICES.length} services, from a full interior reset to multi-stage paint
              correction and ceramic coating. Tell us what your car needs and we&apos;ll quote it.
            </p>
          </Reveal>
        </div>

        <ServiceShowcase />
      </section>

      {/* ═══════════════════ BRING BLACK BACK ═══════════════════ */}
      <BringBlackBack />

      {/* ═══════════════════ GALLERY (before/after sliders) ═══════════════════ */}
      <Gallery />

      {/* ═══════════════════ REVIEWS ═══════════════════ */}
      <ReviewsSection />

      {/* ═══════════════════ REELS ═══════════════════ */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <Eyebrow>Real results</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Straight out of the workshop
          </h2>
          <p className="mt-4 max-w-md text-sm text-white/55">
            Tap a video to play. No filters, no stock footage. These are real customer cars.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-8">
            <Reels reels={REELS} />
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════ GUARANTEE ═══════════════════ */}
      <section className="border-y border-white/10 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <Eyebrow>Our promise</Eyebrow>
            <p className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
              If you&apos;re not happy,
              <br />
              <span className="text-brand-green">you don&apos;t pay.</span>
            </p>
            <p className="mx-auto mt-7 max-w-md text-base leading-relaxed text-white/60">
              We don&apos;t stop until your car looks its absolute best. No arguments, no fine
              print. That&apos;s been our standard since day one.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${CTA_IMAGE})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#050506]/85" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:py-36">
          <Reveal>
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Ready to see it
              <br />
              <span className="text-brand-yellow">transformed?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/65">
              Send us a text with your car and what it needs. We&apos;ll come back with a price
              and a time. No pressure, no obligation.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <TextCta />
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

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-11 w-auto" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
                Premium car detailing in Cairns. Drop your car to our workshop and we&apos;ll take
                care of the rest.
              </p>
            </div>

            <div className="text-sm text-white/60">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                Find us
              </div>
              <p className="mt-3 max-w-[16rem] leading-relaxed">{BUSINESS.address}</p>
              <p className="mt-3">
                <a
                  href={`tel:${BUSINESS.phoneE164}`}
                  className="font-bold text-white transition hover:text-brand-green"
                >
                  {BUSINESS.phone}
                </a>
              </p>
              <p className="mt-1">
                <a href={`mailto:${BUSINESS.email}`} className="transition hover:text-white">
                  {BUSINESS.email}
                </a>
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {BUSINESS.name}. {BUSINESS.suburb}.
            </p>
            <p className="flex gap-4">
              <Link href="/terms" className="transition hover:text-white/70">
                Terms &amp; Conditions
              </Link>
              <Link href="/privacy" className="transition hover:text-white/70">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating text CTA */}
      <a
        href={TEXT_TO_BOOK_HREF}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-3.5 text-sm font-black text-[#04130a] shadow-[0_10px_40px_rgba(43,255,122,0.35)] transition hover:brightness-110 active:scale-95"
      >
        💬 Free Quote
      </a>
    </main>
  );
}
