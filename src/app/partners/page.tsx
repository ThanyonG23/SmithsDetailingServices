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

const OPTIONS: { icon: string; title: string; tag: string; summary: string; give: string; get: string[] }[] = [
  {
    icon: "🏷️",
    title: "Give members a discount",
    tag: "Costs you nothing to join",
    summary: "Offer Smiths members something like 10% off. This is the easy one, and how most partners start.",
    give: "A member discount, that you only ever pay when one of our members actually buys from you. A customer you wouldn't have had otherwise.",
    get: [
      "New local customers you wouldn't have had",
      "Free promotion to our members and audience",
      "Members choosing you over the business next door",
      "Our team comes out regularly to shoot content with your business, promoted across our socials",
    ],
  },
  {
    icon: "🎁",
    title: "Be a giveaway prize",
    tag: "Best for spare capacity",
    summary: "Put up an experience or product as a prize in one of our members' draws.",
    give: "One prize for a single draw, an experience, a service or a product. Perfect if you've got spare seats, a quiet night, or capacity to fill.",
    get: [
      "Featured across every piece of that giveaway's content and the winner reveal",
      "A batch of content you can reuse",
      "Our team comes out regularly to shoot content with your business, promoted across our socials",
    ],
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
                What you give, what you get
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60">
                No fee, no lock-in, no risk. Pick one or do both.
              </p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {OPTIONS.map((o, i) => (
              <Reveal key={o.title} delay={i * 90}>
                <div className="flex h-full flex-col rounded-3xl border border-brand-purple/30 bg-gradient-to-b from-brand-purple/[0.10] to-white/[0.02] p-6 shadow-[0_0_60px_-24px_rgba(124,47,245,0.6)]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl leading-none">{o.icon}</span>
                    <span className="rounded-full bg-brand-purple/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-brand-purple-soft">
                      {o.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">{o.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{o.summary}</p>
                  <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-5">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">You give</div>
                      <div className="mt-1 text-sm leading-relaxed text-white/80">{o.give}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-purple-soft">You get</div>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {o.get.map((g) => (
                          <li key={g} className="flex items-start gap-2 text-sm leading-relaxed text-white/80">
                            <span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
