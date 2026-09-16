import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import GrowthProposalForm from "@/components/GrowthProposalForm";

/* Personalised growth-partner proposal for Diamond Touch Cleaners (accepted on
   the phone off the cold email). Terms in writing, pick-your-commission, and an
   onboarding intake form. Pure landing page. */

export const metadata: Metadata = {
  title: "Your Proposal | Diamond Touch Cleaners × Smiths",
  description:
    "We build and run all your marketing and sell the jobs for you. No upfront cost. Pick your commission model for regular cleans, 30/70 on big one-off jobs. Send us your details to get started.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/diamond-touch" },
};

const SETUP = [
  { t: "Social media, ads & Google", d: "Set up and run for you, targeted at locals ready to book a clean." },
  { t: "High-converting landing pages", d: "Built to turn clicks into booked jobs, not just visits." },
  { t: "AI automation", d: "Only the boring work, so no lead ever slips through." },
  { t: "We sell the jobs", d: "Every lead comes straight to us and we book them for you." },
];

export default function DiamondTouchPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-purple/40 bg-brand-purple/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-brand-purple-soft">
              Your proposal · Diamond Touch Cleaners
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl">
              Let&apos;s fill your <span className="text-brand-purple-soft">calendar.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65">
              Great chatting. Here&apos;s the deal in writing. Pick the terms that suit you, send us your details, and
              we&apos;ll get to work filling your calendar. You just do the cleaning.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section className="px-4 pb-6">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">What we do</div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                We build and run the whole engine
              </h2>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {SETUP.map((s, i) => (
              <Reveal key={s.t} delay={i * 60}>
                <div className="flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>
                  <div>
                    <div className="font-display text-base font-black text-white">{s.t}</div>
                    <div className="mt-1 text-sm text-white/55">{s.d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-white/70">
              We even <span className="font-semibold text-brand-purple-soft">cover the ad spend</span>. Nothing upfront,
              you only ever pay a cut of the work we actually bring you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── THE DEAL / COMMISSION ── */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">The deal</div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Simple, and you choose
              </h2>
            </div>
          </Reveal>

          {/* Regular cleans, two options */}
          <div className="mt-8">
            <div className="text-center text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
              Regular cleans, pick one
            </div>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <Reveal>
                <div className="flex h-full flex-col rounded-3xl border border-white/12 bg-white/[0.02] p-6">
                  <div className="rounded-full bg-brand-purple/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-brand-purple-soft w-fit">
                    Option A
                  </div>
                  <h3 className="mt-3 font-display text-xl font-extrabold text-white">We take the first clean</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    We take 100% of the first clean, then the client is yours. You keep every single clean after that,
                    forever.
                  </p>
                  <p className="mt-3 text-xs font-semibold text-brand-green">Best if you want to own the client outright.</p>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="flex h-full flex-col rounded-3xl border border-white/12 bg-white/[0.02] p-6">
                  <div className="rounded-full bg-brand-purple/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-brand-purple-soft w-fit">
                    Option B
                  </div>
                  <h3 className="mt-3 font-display text-xl font-extrabold text-white">We take 20% ongoing</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    We take 20% of every clean, ongoing, for as long as the client stays. Nothing on the first, we earn
                    only while they keep booking.
                  </p>
                  <p className="mt-3 text-xs font-semibold text-brand-green">Best if you'd rather keep more cash upfront.</p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Big one-off jobs */}
          <Reveal delay={120}>
            <div className="mt-6 rounded-3xl border border-brand-yellow/40 bg-brand-yellow/[0.07] p-6 text-center shadow-glowY">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-yellow">Big one-off jobs</div>
              <div className="mt-2 font-display text-3xl font-black text-white">70% you · 30% us</div>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/65">
                For bigger one-off jobs like bond cleans and deep cleans, it's a simple 70/30 split. You keep 70%, we take
                30% for bringing you the job.
              </p>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="mx-auto mt-6 flex max-w-2xl items-start gap-3 rounded-2xl border border-brand-green/30 bg-brand-green/[0.06] px-5 py-4">
              <span className="mt-0.5 shrink-0 text-brand-green">🛡️</span>
              <span className="text-sm leading-relaxed text-white/75">
                <span className="font-black text-white">Zero risk.</span> No upfront cost, no monthly fee, no lock-in. You
                only ever pay when we actually bring you a paying job.
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── INTAKE FORM ── */}
      <section id="start" className="scroll-mt-6 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="mb-6 text-center">
              <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl">
                Ready? Send us your details.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/60">
                Fill this in and pick your commission option. We&apos;ll take it from there and reach out to organise
                everything we need to get started.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <GrowthProposalForm source="diamond-touch" businessDefault="Diamond Touch Cleaners" />
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Smiths Detailing Services · Cairns</p>
        </div>
      </footer>
    </main>
  );
}
