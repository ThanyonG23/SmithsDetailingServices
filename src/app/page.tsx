import Link from "next/link";
import { BUSINESS, PACKAGES, EXTRAS, REELS, TEXT_TO_BOOK_HREF } from "@/lib/config";
import Reels from "@/components/Reels";
import ReviewsSection from "@/components/ReviewsSection";

function BookButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={TEXT_TO_BOOK_HREF}
      className={`inline-flex items-center justify-center rounded-xl bg-brand-green px-6 py-3.5 font-black text-[#04130a] shadow-glowG transition active:scale-95 ${className}`}
    >
      Text for a Free Quote →
    </a>
  );
}

export default function Home() {
  return (
    <main className="brand-backdrop min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center" aria-label="Smiths Detailing — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-10 w-auto sm:h-11" />
          </Link>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="hidden text-sm font-bold text-white/80 hover:text-white sm:block"
            >
              {BUSINESS.phone}
            </a>
            <a
              href={TEXT_TO_BOOK_HREF}
              className="rounded-lg border-2 border-brand-green px-4 py-2 text-sm font-black text-brand-green transition hover:bg-brand-green/10"
            >
              Free Quote
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-4 pb-10 pt-14 sm:pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/25 bg-brand-yellow/10 px-3 py-1.5 text-xs font-bold text-brand-yellow">
          📍 {BUSINESS.suburb}
        </div>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
          Premium Car Detailing In{" "}
          <span className="text-brand-yellow">Smithfield, Cairns.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
          Showroom-quality interior &amp; exterior detailing, done right at our Smithfield workshop.
          Text us to book — we&apos;ll sort your time and price. Pay on the day.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <BookButton />
          <a
            href={`tel:${BUSINESS.phoneE164}`}
            className="rounded-xl border border-white/15 px-6 py-3.5 font-bold text-white transition hover:border-white/30"
          >
            Call {BUSINESS.phone}
          </a>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Our packages</h2>
        <p className="mt-2 text-sm text-white/60">
          Pricing shown from Single Cab. Final price depends on your vehicle size — you&apos;ll see it
          live when you book.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {PACKAGES.map((p, i) => {
            const glow = i % 2 === 0 ? "feature-glow" : "feature-glow-green";
            return (
              <div
                key={p.key}
                className={`${glow} relative flex flex-col overflow-hidden rounded-3xl border`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${p.image})` }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90"
                  aria-hidden
                />
                <div className="relative flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-extrabold text-white">{p.name}</h3>
                  <p className="mt-2 text-sm text-white/75">{p.tagline}</p>
                  <div className="mt-3 text-xs font-bold text-brand-yellow">
                    ⏱ {p.durationLabel}
                    {p.sevenAmOnly && " • 7:00 AM start"}
                  </div>
                  <ul className="mt-4 grid flex-1 grid-cols-1 gap-2 text-sm text-white/85">
                    {p.includes.map((inc) => (
                      <li key={inc} className="flex gap-2">
                        <span className="text-brand-green">✓</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={TEXT_TO_BOOK_HREF}
                    className="mt-6 inline-flex items-center justify-center rounded-xl border-2 border-brand-green bg-black/30 py-3 font-black text-brand-green backdrop-blur transition hover:bg-brand-green/10"
                  >
                    Text for a free quote
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* REELS */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
          Watch real results
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Recent details straight out of the Smithfield workshop.
        </p>
        <div className="mt-6">
          <Reels reels={REELS} />
        </div>
      </section>

      {/* EXTRAS */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
          Available extras
        </h2>
        <p className="mt-2 text-sm text-white/60">Swipe to browse. Add any of these when you book.</p>
        <div className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-3">
          {EXTRAS.map((e, i) => {
            const glow = i % 2 === 0 ? "feature-glow-green" : "feature-glow";
            return (
              <div
                key={e.key}
                className={`${glow} relative aspect-square w-52 flex-none snap-start overflow-hidden rounded-2xl border sm:w-56`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${e.image})` }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-black/90"
                  aria-hidden
                />
                {e.onlyFor && (
                  <div className="absolute left-3 top-3 z-[4] rounded-full border border-brand-yellow/40 bg-black/55 px-2 py-0.5 text-[10px] font-black text-brand-yellow backdrop-blur">
                    Premium only
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-extrabold leading-tight text-white">{e.label}</h3>
                  <p className="mt-1 text-xs text-white/75">{e.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* REVIEWS */}
      <ReviewsSection />

      {/* GUARANTEE */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-brand-green/30 bg-brand-green/[0.06] p-8 sm:flex-row sm:items-center">
          <div className="text-4xl">💯</div>
          <div>
            <div className="text-xl font-extrabold text-white">
              Our 100% satisfaction guarantee
            </div>
            <p className="mt-1 text-sm text-white/75">
              We don&apos;t stop until your car looks its absolute best. If you&apos;re not happy with
              the result, you don&apos;t pay. Simple as that.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-4">
        <div className="rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.05] to-transparent p-8 text-center">
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            Ready to transform your car?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
            Send us a text and we&apos;ll lock in your spot. Drop your car to our Smithfield
            workshop and we&apos;ll handle the rest.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <BookButton />
            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="rounded-xl border border-white/15 px-6 py-3.5 font-bold text-white transition hover:border-white/30"
            >
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-white/55">
          <div className="font-black tracking-widest text-brand-yellow">SMITHS DETAILING</div>
          <p className="mt-2">{BUSINESS.address}</p>
          <p className="mt-1">
            <a href={`tel:${BUSINESS.phoneE164}`} className="hover:text-white">
              {BUSINESS.phone}
            </a>{" "}
            ·{" "}
            <a href={`mailto:${BUSINESS.email}`} className="hover:text-white">
              {BUSINESS.email}
            </a>
          </p>
          <p className="mt-4 text-xs text-white/35">
            © {new Date().getFullYear()} {BUSINESS.name}. Based in {BUSINESS.suburb}.
          </p>
        </div>
      </footer>

      {/* Floating text-to-book button (always visible) */}
      <a
        href={TEXT_TO_BOOK_HREF}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-3.5 text-sm font-black text-[#04130a] shadow-glowG transition active:scale-95"
      >
        💬 Free Quote
      </a>
    </main>
  );
}
