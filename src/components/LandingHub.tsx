import Link from "next/link";
import Reveal from "@/components/Reveal";
import ReviewsSection from "@/components/ReviewsSection";
import { BUSINESS } from "@/lib/config";

type Offer = {
  href: string;
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
    icon: "✨",
    title: "Detailing",
    desc: "Interior resets, cut & polish, multi-stage paint correction and ceramic coatings — done properly at our Cairns workshop.",
    tag: "100+ 5★ Google reviews",
    cta: "Explore detailing",
    live: true,
    accent: "green",
  },
  {
    href: "/membership",
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
  const tagCls = o.live
    ? `${accentText} border-white/12`
    : "text-white/50 border-white/12";
  return (
    <Link
      href={o.href}
      className={`group flex h-full flex-col rounded-3xl border border-white/12 bg-white/[0.02] p-7 transition hover:bg-white/[0.035] ${accentBorder}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-4xl leading-none">{o.icon}</span>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tagCls}`}>
          {o.tag}
        </span>
      </div>
      <h3 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-white">{o.title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-white/60">{o.desc}</p>
      <span
        className={`mt-6 inline-flex items-center gap-1.5 font-display text-sm font-black ${accentText}`}
      >
        {o.cta}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
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
          <a
            href={`tel:${BUSINESS.phoneE164}`}
            className="text-sm font-bold text-white/70 transition hover:text-white"
          >
            {BUSINESS.phone}
          </a>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[440px] w-[560px] -translate-x-1/2 rounded-full opacity-[0.14] blur-[130px]"
          style={{ background: "radial-gradient(closest-side, #2bff7a, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 pb-4 pt-20 text-center sm:pt-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
              📍 {BUSINESS.suburb}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-7 font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-7xl">
              Everything your car needs,
              <span className="text-brand-green"> in one place.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/65">
              Detailing done properly, a membership that keeps your car clean and serviced on a schedule,
              and vehicle hire on the way. Pick where you&apos;d like to start.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ 3 OFFERS ═══ */}
      <section className="px-4 pb-8 pt-8">
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
