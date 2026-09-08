import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SiteNav from "@/components/SiteNav";
import BusinessPartnerForm from "@/components/BusinessPartnerForm";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Partner with Smiths",
  description: "Put your business in front of a growing local membership. Feature as a giveaway prize or offer a member discount.",
  alternates: { canonical: "/partners" },
};

const LOGO = BUSINESS.logo;

const STACK: { icon: string; title: string; desc: string }[] = [
  {
    icon: "🎁",
    title: "Be a giveaway prize",
    desc: "We feature your business as an experience our members win, and promote it across our socials and paid ads the whole way through. You get real exposure and a batch of content you can reuse.",
  },
  {
    icon: "🏷️",
    title: "Offer a member perk",
    desc: "List a member discount, like 10% off for Smiths members, and put your business in front of a growing base of local customers who are already spending.",
  },
  {
    icon: "🤝",
    title: "Grow together, locally",
    desc: "This is Cairns businesses backing each other. We cross-promote our partners, and our members get a genuine reason to choose you first.",
  },
];

const STEPS: { n: string; t: string; d: string }[] = [
  { n: "1", t: "Reach out", d: "Fill in the form below or give Thanyon a call. Quick chat, no obligation." },
  { n: "2", t: "We feature you", d: "Either as a giveaway experience, a member discount, or both. We handle the promo." },
  { n: "3", t: "You get seen", d: "Exposure to our whole audience, fresh content, and new local customers through the door." },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <SiteNav cta={{ label: "Get in touch", href: "#contact" }} accent="purple" />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[8%] h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-8 pt-14 text-center sm:pt-20">
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Detailing" className="mx-auto w-full max-w-[190px] sm:max-w-[220px]" />
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
              For local businesses
            </div>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Put your business in front of our <span className="text-brand-purple-soft">members</span>
            </h1>
          </Reveal>
          <Reveal delay={250}>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              We&apos;re building a Cairns membership with regular giveaways and a growing local audience. Partner with us
              to reach them, for free.
            </p>
          </Reveal>
          <Reveal delay={350}>
            <a
              href="#contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-purple px-8 py-3.5 font-display text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110 active:scale-95"
            >
              Become a partner
            </a>
          </Reveal>
        </div>
      </section>

      {/* ═══ WHAT YOU GET ═══ */}
      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Two ways to partner</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Real exposure, no ad spend
              </h2>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STACK.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="flex h-full flex-col rounded-2xl border border-brand-purple/25 bg-gradient-to-b from-brand-purple/[0.08] to-white/[0.02] p-5">
                  <span className="text-2xl leading-none">{s.icon}</span>
                  <h3 className="mt-3 font-display text-lg font-extrabold tracking-tight text-white">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="border-y border-white/5 bg-white/[0.015] px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              How it works
            </h2>
          </Reveal>
          <div className="mt-8 flex flex-col gap-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-purple/40 bg-brand-purple/[0.12] font-display text-sm font-black text-brand-purple-soft">
                    {s.n}
                  </span>
                  <div>
                    <div className="font-display text-base font-extrabold text-white">{s.t}</div>
                    <div className="mt-0.5 text-sm leading-relaxed text-white/60">{s.d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" className="scroll-mt-16 px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-md">
          <Reveal>
            <BusinessPartnerForm />
          </Reveal>
          <Reveal>
            <p className="mt-5 text-center text-sm text-white/50">
              Prefer to talk?{" "}
              <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-brand-purple-soft underline underline-offset-4 transition hover:text-white">
                Call Thanyon on {BUSINESS.phone}
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths Detailing" className="mx-auto h-12 w-auto" />
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/50">{BUSINESS.address}</p>
          <Link href="/membership" className="mt-5 inline-block text-sm text-white/50 underline underline-offset-4 transition hover:text-white">
            ← Back to membership
          </Link>
        </div>
      </footer>
    </main>
  );
}
