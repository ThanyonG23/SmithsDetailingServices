import Link from "next/link";
import Reveal from "@/components/Reveal";
import ReviewsSection from "@/components/ReviewsSection";
import { BUSINESS } from "@/lib/config";

/* Imagery — swap any path to change the photo. */
const HERO_IMG = "/media/photos/hero-mustang-v2.jpg";

type Offer = {
  href: string;
  image: string;
  icon: string;
  title: string;
  desc: string;
  tag: string;
  cta: string;
  live: boolean;
  accent: "green" | "yellow";
};

const OFFERS: Offer[] = [
  {
    href: "/detailing",
    image: "/media/photos/paint-gloss.jpg",
    icon: "✨",
    title: "Detailing",
    desc: "Interior resets, cut & polish, multi-stage paint correction and ceramic coatings — done properly at our Cairns workshop.",
    tag: "100+ 5★ reviews",
    cta: "Explore detailing",
    live: true,
    accent: "green",
  },
  {
    href: "/membership",
    image: "/media/photos/cutpolish.jpg",
    icon: "🔑",
    title: "Membership",
    desc: "Hand us the keys and we keep your car detailed and serviced on a schedule — always clean, always sorted, one weekly payment.",
    tag: "From $39 / week",
    cta: "See the membership",
    live: true,
    accent: "yellow",
  },
  {
    href: "/hire",
    image: "/media/photos/hand-wax.jpg",
    icon: "🚗",
    title: "Vehicle Hire",
    desc: "Need a set of wheels? Clean, well-maintained vehicles for hire in Cairns — detailed to the standard you know us for.",
    tag: "Coming soon",
    cta: "Join the waitlist",
    live: false,
    accent: "green",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">{children}</div>;
}

function OfferCard({ o }: { o: Offer }) {
  const accentText = o.accent === "yellow" ? "text-brand-yellow" : "text-brand-green";
  const accentBorder = o.accent === "yellow" ? "hover:border-brand-yellow/45" : "hover:border-brand-green/45";
  return (
    <Link
      href={o.href}
      className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-white/12 bg-white/[0.02] transition hover:bg-white/[0.035] ${accentBorder}`}
    >
      {/* photo */}
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={o.image}
          alt={o.title}
          className="h-full w-full object-cover transition duration-[600ms] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0c] via-[#0a0b0c]/25 to-transparent" aria-hidden />
        <span className="absolute left-4 top-4 text-3xl leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">{o.icon}</span>
        <span
          className={`absolute right-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur ${
            o.live ? accentText : "text-white/70"
          }`}
        >
          {o.tag}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-display text-2xl font-extrabold tracking-tight text-white">{o.title}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-white/60">{o.desc}</p>
        <span className={`mt-auto inline-flex items-center gap-1.5 pt-6 font-display text-sm font-black ${accentText}`}>
          {o.cta}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function LandingHub() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ═══ NAV ═══ */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center" aria-label="Smiths home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-10 w-auto sm:h-11" />
          </Link>
          <a href={`tel:${BUSINESS.phoneE164}`} className="text-sm font-bold text-white/70 transition hover:text-white">
            {BUSINESS.phone}
          </a>
        </div>
      </header>

      {/* ═══ HERO (full-bleed photo) ═══ */}
      <section className="relative flex min-h-[72vh] items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${HERO_IMG})`, backgroundPosition: "72% center" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/55 to-black/25" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050506] to-transparent" aria-hidden />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-32">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
              📍 {BUSINESS.suburb}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Everything your car needs,
              <span className="text-brand-green"> in one place.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
              Detailing done properly, a membership that keeps your car clean and serviced on a schedule,
              and vehicle hire on the way. Pick where you&apos;d like to start.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ 3 OFFERS ═══ */}
      <section className="relative z-10 -mt-10 px-4 pb-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {OFFERS.map((o, i) => (
            <Reveal key={o.title} delay={i * 100}>
              <OfferCard o={o} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section className="mt-8 border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 md:grid-cols-4">
          {[
            { big: "100+", small: "5-star Google reviews" },
            { big: "100%", small: "Satisfaction guarantee" },
            { big: "Est. 2024", small: "Cairns workshop" },
            { big: "Local", small: BUSINESS.suburb },
          ].map((item) => (
            <div key={item.small} className="py-7 text-center">
              <div className="font-display text-2xl font-extrabold text-white sm:text-3xl">{item.big}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/45">{item.small}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <ReviewsSection />

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-11 w-auto" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
                Detailing, membership car care and vehicle hire — all in one place in {BUSINESS.suburb}.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link href="/detailing" className="font-semibold text-white/70 transition hover:text-white">Detailing</Link>
                <Link href="/membership" className="font-semibold text-white/70 transition hover:text-white">Membership</Link>
                <Link href="/hire" className="font-semibold text-white/70 transition hover:text-white">Vehicle Hire</Link>
              </div>
            </div>
            <div className="text-sm text-white/60">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">Find us</div>
              <p className="mt-3 max-w-[16rem] leading-relaxed">{BUSINESS.address}</p>
              <p className="mt-3">
                <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-white transition hover:text-brand-green">
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
            <p>© {new Date().getFullYear()} {BUSINESS.name}. {BUSINESS.suburb}.</p>
            <p className="flex gap-4">
              <Link href="/terms" className="transition hover:text-white/70">Terms &amp; Conditions</Link>
              <Link href="/privacy" className="transition hover:text-white/70">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
