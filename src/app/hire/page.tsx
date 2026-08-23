import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import HireWaitlist from "@/components/HireWaitlist";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Vehicle Hire — Coming Soon | Smiths, Cairns",
  description:
    "Vehicle hire is coming to Smiths in Cairns — clean, well-maintained vehicles, simple booking. Join the waitlist to be first to know.",
  robots: { index: false, follow: false }, // coming soon — keep out of search for now
  alternates: { canonical: "/hire" },
};

const LOGO = BUSINESS.logo;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">{children}</div>;
}

const PERKS: { icon: string; title: string; body: string }[] = [
  { icon: "✨", title: "Spotless every time", body: "Every vehicle detailed to our standard before you get the keys — because that's what we do." },
  { icon: "🔧", title: "Properly maintained", body: "Serviced and road-ready, so you drive off with total confidence." },
  { icon: "📍", title: "Local & simple", body: "Right here in Cairns. Easy booking, no airport queues, no fuss." },
];

export default function HirePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ═══ NAV ═══ */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" aria-label="Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths" className="h-10 w-auto sm:h-11" />
          </Link>
          <a href="#waitlist" className="rounded-full bg-brand-green px-4 py-2 text-xs font-black text-brand-ink transition hover:brightness-110">
            Join Waitlist
          </a>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[26%] h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #2bff7a, transparent 70%)" }}
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050506] to-transparent" aria-hidden />

        <div className="relative mx-auto w-full max-w-3xl px-5 py-16 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
              Coming soon · Cairns
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-7 font-display text-5xl font-extrabold leading-[1.0] tracking-tight text-white sm:text-7xl">
              Vehicle <span className="text-brand-green">Hire</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/65">
              Need a set of wheels? We&apos;re bringing clean, well-maintained vehicles for hire to Cairns —
              detailed to the standard you already know us for. Be first in line.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <a
              href="#waitlist"
              className="mt-9 inline-flex rounded-full bg-brand-green px-8 py-4 font-display text-base font-extrabold text-brand-ink shadow-[0_10px_40px_rgba(43,255,122,0.25)] transition hover:brightness-110 active:scale-95"
            >
              Join the waitlist →
            </a>
          </Reveal>
        </div>
      </section>

      {/* ═══ WHAT TO EXPECT ═══ */}
      <section className="border-y border-white/5 bg-white/[0.015] py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Reveal>
            <div className="text-center">
              <Eyebrow>What to expect</Eyebrow>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Hire from people who care about cars
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {PERKS.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-3xl leading-none">{p.icon}</div>
                  <h3 className="mt-4 font-display text-lg font-extrabold tracking-tight text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WAITLIST ═══ */}
      <section id="waitlist" className="scroll-mt-8 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl px-4">
          <Reveal>
            <div className="mb-8 text-center">
              <Eyebrow>Be first in</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Join the <span className="text-brand-green">waitlist</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <HireWaitlist />
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths" className="mx-auto h-11 w-auto" />
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/50">{BUSINESS.address}</p>
          <p className="mt-3 text-sm">
            <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-white transition hover:text-brand-green">
              {BUSINESS.phone}
            </a>
          </p>
          <Link href="/" className="mt-5 inline-block text-sm text-white/50 underline underline-offset-4 transition hover:text-white">
            ← Back to Smiths
          </Link>
        </div>
      </footer>
    </main>
  );
}
