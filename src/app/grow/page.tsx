import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";
import Reveal from "@/components/Reveal";
import SiteNav from "@/components/SiteNav";
import GrowthLeadForm from "@/components/GrowthLeadForm";

/* Growth-partner service landing page. Cold traffic from DMs/emails lands here.
   Full 100M-offer structure: dream outcome, deliverables, real proof, a stacked
   risk-reversal, speed and exclusivity, then a simple call-booking form.
   Noindex, it's a direct-link page, not for search. */

export const metadata: Metadata = {
  title: "We Fill Your Calendar | Smiths",
  description:
    "We set up and run all your marketing and sell the jobs for you. No upfront cost, you only pay a small cut of the jobs we book. If we don't book you 10 jobs in your first 4 weeks, we work for free until we do.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/grow" },
};

const SETUP = [
  { t: "Social media accounts", d: "Set up and posting, so you actually show up online." },
  { t: "Facebook ads", d: "Run and managed by us, targeted at local customers ready to book." },
  { t: "Google ads", d: "Catch the people already searching for what you do." },
  { t: "High-converting landing pages", d: "Built to turn clicks into booked jobs, not just visits." },
  { t: "AI automation", d: "Every lead captured and followed up instantly, day or night." },
];

export default function GrowLanding() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <SiteNav cta={{ label: "Get started", href: "#contact" }} accent="purple" />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[10%] h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-14 text-center sm:pt-20">
          <Reveal delay={100}>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
              For local service businesses
            </div>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Want your calendar filled consistently,
              <br className="hidden sm:block" />{" "}
              <span className="text-brand-purple-soft">without paying a marketing agency?</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              Someone to actually sell the jobs for your business, so you never have to worry about
              finding work or chasing customers again. You just show up and do what you&apos;re good at.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-purple px-8 py-3.5 font-display text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110 active:scale-95"
            >
              Fill my calendar →
            </a>
          </Reveal>
        </div>
      </section>

      {/* ═══ WHAT WE SET UP ═══ */}
      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
                What we set up for you
              </div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your whole customer engine, built and run for you
              </h2>
            </div>
          </Reveal>
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
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
            <p className="mx-auto mt-7 max-w-xl text-center text-base leading-relaxed text-white/70">
              Every lead comes <span className="font-semibold text-brand-purple-soft">straight to us</span>, and{" "}
              <span className="font-semibold text-brand-purple-soft">we sell them for you</span>. You never chase a lead or
              close a job again. You just turn up to the work.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ PROOF ═══ */}
      <section className="border-y border-white/10 bg-white/[0.02] px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Why us</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              We&apos;ve actually done this ourselves
            </h2>
            <p className="mx-auto mt-5 text-base leading-relaxed text-white/70">
              We built and run every bit of this for our own business, Smiths Detailing, the brand you&apos;ve probably
              already seen around Cairns, with 100+ five-star reviews. And it&apos;s not just cars. I&apos;ve owned and run
              lawn mowing and cleaning businesses myself, so I know exactly what it takes to keep a trade booked out.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ THE OFFER / RISK REVERSAL ═══ */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
                The best part
              </div>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                No upfront cost. No risk. You only pay when we bring you jobs.
              </h2>
            </div>
          </Reveal>
          <div className="mx-auto mt-9 flex max-w-xl flex-col gap-3">
            {[
              { t: "Nothing upfront", d: "We build and run everything at our own cost. You don't pay a cent to start." },
              { t: "We only take a small cut of the jobs we book you", d: "No jobs, no cost. Our incentives are locked to yours, we don't get paid unless you do." },
              { t: "Live in just a few days", d: "Not weeks. We move fast and get your customer engine running quickly." },
              { t: "One business per trade, per area", d: "Once we build yours, we won't build a competitor's. First in, locks it in." },
            ].map((item, i) => (
              <Reveal key={item.t} delay={i * 60}>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>
                  <div>
                    <div className="font-display text-base font-black text-white">{item.t}</div>
                    <div className="mt-1 text-sm text-white/55">{item.d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* The guarantee */}
          <Reveal delay={120}>
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-brand-purple/45 bg-brand-purple/[0.1] p-6 text-center shadow-[0_0_44px_-16px_rgba(124,47,245,0.9)]">
              <div className="text-2xl">🛡️</div>
              <p className="mt-2 font-display text-xl font-black leading-snug text-white sm:text-2xl">
                If we don&apos;t book you 10 jobs in your first 4 weeks, we work for free until we do.
              </p>
              <p className="mt-2 text-sm text-white/60">No cut, no cost, nothing, until you&apos;re winning.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="border-y border-white/10 bg-white/[0.02] px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">How it works</div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Three steps and you&apos;re booked out
              </h2>
            </div>
          </Reveal>
          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[
              { n: "1", t: "Quick call", d: "We learn your business and what a good job looks like for you." },
              { n: "2", t: "We build it all", d: "Ads, pages, socials and automation, live in a few days." },
              { n: "3", t: "You get booked", d: "Leads come to us, we sell them, you turn up and do the work." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple font-display text-base font-black text-white">
                    {s.n}
                  </div>
                  <div className="mt-4 font-display text-lg font-black text-white">{s.t}</div>
                  <div className="mt-2 text-sm text-white/55">{s.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT / FORM ═══ */}
      <section id="contact" className="scroll-mt-16 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="mb-7 text-center">
              <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl">
                Interested? Let&apos;s get you <span className="text-brand-purple-soft">booked out.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/60">
                Fill out your details and I&apos;ll give you a call to walk you through exactly how it works. No obligation.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <GrowthLeadForm />
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BUSINESS.logo} alt={BUSINESS.name} className="mx-auto h-9 w-auto" />
          <p className="mt-4 text-sm">
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
