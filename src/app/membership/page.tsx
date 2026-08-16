import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import MembershipSignup from "@/components/MembershipSignup";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Smiths Garage Maintenance | Cairns",
  description:
    "Hand us the keys and we'll keep your car clean and serviced on a schedule. A membership from Smiths Garage, Cairns, for people who'd rather not think about their car.",
  robots: { index: false, follow: false }, // sent direct to customers — not for search
  alternates: { canonical: "/membership" },
};

const LOGO = "/smiths-garage-logo.png";

// ── The price. Change this line only. ──
const PRICE = "$49";

const INCLUSIONS: { icon: string; text: string }[] = [
  { icon: "✨", text: "Full interior and exterior detail every 3 months" },
  { icon: "🔧", text: "A basic service each visit (oil, filters, fluids)" },
  { icon: "⚡", text: "Priority booking, members come first" },
  { icon: "💳", text: "One simple weekly payment" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">{children}</div>;
}

export default function MembershipPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ═══ NAV ═══ */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths Garage" className="h-10 w-auto mix-blend-screen sm:h-11" />
          <a href="#reserve" className="rounded-full bg-brand-purple px-4 py-2 text-xs font-black text-white transition hover:brightness-110">
            Reserve Spot
          </a>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[78vh] items-center overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[24%] h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.26] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[40%] h-[340px] w-[340px] -translate-x-1/2 rounded-full opacity-[0.14] blur-[100px]"
          style={{ background: "radial-gradient(closest-side, #FFE600, transparent 70%)" }}
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050506] to-transparent" aria-hidden />

        <div className="relative mx-auto w-full max-w-3xl px-5 py-16 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/40 bg-brand-purple/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-purple-soft" />
              Members only · Cairns
            </span>
          </Reveal>
          <Reveal delay={100}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Garage" className="mx-auto mt-7 w-full max-w-md mix-blend-screen" />
          </Reveal>
          <Reveal delay={200}>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Hand us the keys.
              <span className="text-brand-purple-soft"> We&apos;ll take care of the rest.</span>
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-white/65">
              For the people who keep meaning to get their car detailed and serviced but never find
              the time. Drop it off and we handle both, on a schedule, so it&apos;s always clean and
              always sorted. You never think about it again.
            </p>
          </Reveal>
          <Reveal delay={400}>
            <a
              href="#reserve"
              className="mt-9 inline-flex rounded-full bg-brand-purple px-8 py-4 font-display text-base font-extrabold text-white transition hover:brightness-110 active:scale-95"
            >
              Reserve my spot →
            </a>
          </Reveal>
        </div>
      </section>

      {/* ═══ THE PLAN ═══ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-2xl px-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-brand-purple/30 bg-gradient-to-b from-brand-purple/[0.10] to-transparent p-7 sm:p-10">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full opacity-25 blur-[80px]"
                style={{ background: "radial-gradient(closest-side, #FFE600, transparent 70%)" }}
                aria-hidden
              />
              <div className="relative text-center">
                <Eyebrow>The membership</Eyebrow>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Smiths Garage Maintenance
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/55">
                  Everything your car needs, handled on a schedule. You just drop it off.
                </p>
                <div className="mt-6 flex items-end justify-center gap-1.5">
                  <span className="mb-2 text-lg font-bold text-white/50">From</span>
                  <span className="font-display text-5xl font-black text-white sm:text-6xl">{PRICE}</span>
                  <span className="mb-2 text-lg font-bold text-white/50">/week</span>
                </div>
                <p className="mt-1 text-xs text-white/40">Billed weekly · cancel anytime · larger vehicles slightly more</p>
              </div>

              <ul className="mt-8 flex flex-col gap-3">
                {INCLUSIONS.map((it) => (
                  <li key={it.text} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-[15px] text-white/85">
                    <span className="text-lg leading-none">{it.icon}</span>
                    <span>{it.text}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#reserve"
                className="mt-8 flex w-full items-center justify-center rounded-full bg-brand-yellow px-7 py-4 font-display text-base font-black text-brand-ink transition hover:brightness-110 active:scale-95"
              >
                Reserve my spot →
              </a>
              <p className="mt-3 text-center text-[13px] text-white/45">
                💯 Backed by the Smiths promise: if you&apos;re not happy, you don&apos;t pay.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ RESERVE ═══ */}
      <section id="reserve" className="scroll-mt-8 pb-24">
        <div className="mx-auto max-w-xl px-4">
          <Reveal>
            <MembershipSignup />
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths Garage" className="mx-auto h-12 w-auto mix-blend-screen" />
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/50">{BUSINESS.address}</p>
          <p className="mt-3 text-sm">
            <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-white transition hover:text-brand-purple-soft">
              {BUSINESS.phone}
            </a>
          </p>
          <Link href="/" className="mt-5 inline-block text-sm text-white/50 underline underline-offset-4 transition hover:text-white">
            ← Smiths Detailing
          </Link>
        </div>
      </footer>
    </main>
  );
}
