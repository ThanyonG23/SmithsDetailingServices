import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import GarageWaitlist from "@/components/GarageWaitlist";
import { GARAGE_SERVICES, MEMBERSHIP_NAME, MEMBERSHIP_PERKS } from "@/lib/garage";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Smiths Garage — Coming Soon | Cairns",
  description:
    "Smiths Detailing is becoming Smiths Garage — detailing, paint correction, servicing, touch-up paint, headlight restoration and parts, all under one roof in Cairns. Join the waitlist.",
  // Soft launch — keep it out of search until the public rebrand goes live.
  robots: { index: false, follow: false },
  alternates: { canonical: "/garage" },
};

const LOGO = "/smiths-garage-logo.png";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">{children}</div>
  );
}

export default function GaragePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ═══════════════ NAV ═══════════════ */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths Garage" className="h-10 w-auto mix-blend-screen sm:h-11" />
          <a
            href="#waitlist"
            className="rounded-full bg-brand-purple px-4 py-2 text-xs font-black text-white transition hover:brightness-110"
          >
            Join Waitlist
          </a>
        </div>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        {/* ambient glows */}
        <div
          className="pointer-events-none absolute left-1/2 top-[22%] h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-[0.28] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[38%] h-[360px] w-[360px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[100px]"
          style={{ background: "radial-gradient(closest-side, #FFE600, transparent 70%)" }}
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050506] to-transparent" aria-hidden />

        <div className="relative mx-auto w-full max-w-4xl px-5 py-20 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/40 bg-brand-purple/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-purple-soft" />
              Coming soon · {BUSINESS.suburb.split(",").slice(-1)[0].trim() || "Cairns"}
            </span>
          </Reveal>

          <Reveal delay={100}>
            {/* the logo is the wordmark; keep a real h1 for SEO/screen readers */}
            <h1 className="sr-only">Smiths Garage — Cairns</h1>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO}
              alt="Smiths Garage"
              className="mx-auto mt-8 w-full max-w-lg mix-blend-screen"
            />
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              The detailing you know us for is growing up. Everything your car needs to look sharp
              and run right — <span className="text-white">under one roof.</span>
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#waitlist"
                className="rounded-full bg-brand-purple px-7 py-4 text-sm font-black text-white transition hover:brightness-110 active:scale-95"
              >
                Join the waitlist →
              </a>
              <a
                href="#membership"
                className="rounded-full border border-white/20 px-7 py-4 text-sm font-bold text-white transition hover:border-white/40"
              >
                See the membership
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ TRUST STRIP ═══════════════ */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 md:grid-cols-4">
          {[
            { big: "6", small: "Services under one roof" },
            { big: "Every 3mo", small: "Membership care plan" },
            { big: "Cairns", small: "Local workshop" },
            { big: "Est. 2024", small: "By Smiths Detailing" },
          ].map((item) => (
            <div key={item.small} className="py-7 text-center">
              <div className="font-display text-2xl font-extrabold text-white sm:text-3xl">{item.big}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/45">{item.small}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ SERVICES ═══════════════ */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <Eyebrow>What&apos;s coming</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              One place for the
              <span className="text-brand-purple-soft"> whole car.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
              The same standard we&apos;ve built our name on — now covering how it runs, not just how
              it looks.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GARAGE_SERVICES.map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 80}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-brand-purple/40 hover:bg-brand-purple/[0.04]">
                  <div className="text-3xl leading-none">{s.icon}</div>
                  <div className="mt-4 font-display text-lg font-extrabold tracking-tight text-white">
                    {s.name}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{s.blurb}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ MEMBERSHIP ═══════════════ */}
      <section id="membership" className="scroll-mt-8 border-y border-white/10 py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative overflow-hidden rounded-3xl border border-brand-purple/25 bg-gradient-to-br from-brand-purple/[0.12] via-brand-purple/[0.04] to-transparent p-8 sm:p-12">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-[90px]"
              style={{ background: "radial-gradient(closest-side, #FFE600, transparent 70%)" }}
              aria-hidden
            />
            <div className="relative">
              <Reveal>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-yellow">
                  The big one
                </div>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                  {MEMBERSHIP_NAME}
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
                  Stop thinking about your car. On the membership it&apos;s detailed and serviced on a
                  schedule — always clean, always roadworthy — for one simple monthly payment.
                </p>
              </Reveal>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {MEMBERSHIP_PERKS.map((perk, i) => (
                  <Reveal as="li" key={perk} delay={(i % 2) * 70} className="flex items-start gap-3 text-[15px] text-white/85">
                    <span className="mt-0.5 shrink-0 text-brand-yellow">✓</span>
                    <span>{perk}</span>
                  </Reveal>
                ))}
              </ul>

              <Reveal delay={120}>
                <a
                  href="#waitlist"
                  className="mt-9 inline-flex rounded-full bg-brand-yellow px-7 py-4 text-sm font-black text-brand-ink transition hover:brightness-110 active:scale-95"
                >
                  Get first dibs on a spot →
                </a>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ WAITLIST ═══════════════ */}
      <section id="waitlist" className="scroll-mt-8 py-24 sm:py-28">
        <div className="mx-auto max-w-2xl px-4">
          <Reveal>
            <div className="mb-8 text-center">
              <Eyebrow>Be first in</Eyebrow>
              <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Join the <span className="text-brand-purple-soft">waitlist</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <GarageWaitlist />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="Smiths Garage" className="h-14 w-auto mix-blend-screen" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
                Detailing, correction, servicing and more — coming soon to {BUSINESS.suburb}.
              </p>
            </div>
            <div className="text-sm text-white/60">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">Find us</div>
              <p className="mt-3 max-w-[16rem] leading-relaxed">{BUSINESS.address}</p>
              <p className="mt-3">
                <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-white transition hover:text-brand-purple-soft">
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
          <div className="mt-12 border-t border-white/5 pt-6 text-center">
            <Link href="/" className="text-sm text-white/55 underline underline-offset-4 transition hover:text-white">
              ← Back to Smiths Detailing
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
