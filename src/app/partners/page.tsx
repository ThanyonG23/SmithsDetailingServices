import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SiteNav from "@/components/SiteNav";
import BusinessPartnerForm from "@/components/BusinessPartnerForm";
import PlatinumPricing from "@/components/PlatinumPricing";
import Reels from "@/components/Reels";
import { BUSINESS } from "@/lib/config";

const PARTNER_REELS = [
  "/media/videos/reel1.mp4",
  "/media/videos/reel2.mp4",
  "/media/videos/reel3.mp4",
  "/media/videos/reel4.mp4",
  "/media/videos/reel5.mp4",
  "/media/videos/reel6.mp4",
];

export const metadata: Metadata = {
  title: "Partner with Smiths",
  description: "Put your business in front of a growing local membership. Feature as a giveaway prize or offer a member discount.",
  alternates: { canonical: "/partners" },
};

const OPTIONS: { icon: string; title: string; tag: string; summary: string; give: string; get: string[] }[] = [
  {
    icon: "🏷️",
    title: "Give members a discount",
    tag: "Costs you nothing to join",
    summary: "Offer Smiths members something like 10% off. This is the easy one.",
    give: "A member discount, that you only ever pay when one of our members actually buys from you. A customer you wouldn't have had otherwise.",
    get: [
      "New local customers you wouldn't have had",
      "Free promotion to our members and audience",
      "Members choosing you over the business next door",
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
      "Our team comes out to shoot a batch of content with your business, promoted across our socials for the giveaway",
    ],
  },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <SiteNav cta={{ label: "Get in touch", href: "#contact" }} accent="purple" />

      {/* ═══ HERO (marketing proof) ═══ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[8%] h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-14 text-center sm:pt-20">
          <Reveal delay={100}>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
              For local businesses
            </div>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              You&apos;ve seen our marketing around Cairns.
              <br className="hidden sm:block" /> <span className="text-brand-purple-soft">Now let our marketing work for your business.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <div className="mx-auto mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "$132k+", t: "spent on ads" },
                { k: "9x", t: "return on ad spend" },
                { k: "3 years", t: "perfecting it" },
                { k: "100+", t: "5-star reviews" },
              ].map((s) => (
                <div key={s.t} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="font-display text-2xl font-black text-brand-purple-soft sm:text-3xl">{s.k}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/45 sm:text-[11px]">{s.t}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={250}>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              We&apos;ve spent three years, created over 500 pieces of content for ourselves, and spent $132,854 of our own
              money learning exactly what gets local attention.{" "}
              <span className="font-semibold text-brand-purple-soft">
                Business owners tell us all the time they wish they had someone to do it for them. Now you can.
              </span>
            </p>
          </Reveal>
          <Reveal delay={350}>
            <a
              href="#platinum"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-purple px-8 py-3.5 font-display text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110 active:scale-95"
            >
              Become a partner
            </a>
          </Reveal>
        </div>
      </section>

      {/* ═══ OUR WORK / REELS ═══ */}
      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Our work</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Every style of content, for your brand
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60">
                Educational, community, skits, comedy, giveaways, trends. Whatever suits your business, we make it. Swipe to watch.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-8">
              <Reels reels={PARTNER_REELS} labels={["Educational", "Trend", "Comedy", "Giveaway", "Community Event", "Skit"]} />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-white/60 sm:text-base">
              We test everything. On 11 September we posted{" "}
              <span className="font-bold text-brand-purple-soft">40 pieces of content</span> on our own socials in a single
              day. Volume is the new game.{" "}
              <span className="font-semibold text-white">How much volume can you do alone?</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ REACH BAND (moved from hero) ═══ */}
      <section className="border-y border-white/8 bg-white/[0.02] px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl">
              Put your business across multiple platforms to reach more <span className="text-brand-purple-soft">eyeballs</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              We&apos;re building a Cairns membership with regular giveaways and a growing local raving audience. Partner
              with us to reach them.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ WHAT YOU GET ═══ */}
      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Ways to partner</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                What you give, what you get
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60">
                Go all in with Platinum, or try us out with a free partnership.
              </p>
            </div>
          </Reveal>
          {/* Platinum, the paid tier (shown first) */}
          <Reveal delay={80}>
            <div id="platinum" className="mt-8 scroll-mt-24 overflow-hidden rounded-3xl border border-brand-purple/45 bg-gradient-to-b from-brand-purple/[0.12] to-white/[0.02] p-6 shadow-[0_0_60px_-24px_rgba(124,47,245,0.6)] sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl leading-none">💎</span>
                <span className="rounded-full bg-brand-purple/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-brand-purple-soft">
                  Our biggest push
                </span>
                <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-300">
                  Only 10 spots
                </span>
                <span className="rounded-full bg-brand-green/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-brand-green">
                  First content live in 3 days
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Platinum partner</h3>
              <PlatinumPricing />
              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-purple-soft">You get</div>
                <ul className="mt-2 flex flex-col gap-2">
                  {[
                    "Never think about creating content for your business again",
                    "Get seen across multiple channels",
                    "Build brand awareness through partnerships",
                    "Build momentum to help you stay busy",
                    "Have content ready for paid advertisement",
                  ].map((g) => (
                    <li key={g} className="flex items-start gap-2.5 text-sm font-semibold leading-relaxed text-white">
                      <span className="mt-0.5 shrink-0 text-brand-green">✓</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-white/55">
                  <span className="font-bold text-white/75">Includes:</span> a full shoot day at your business every month, posted across all our socials every week, a giveaway feature and member discount, direct links from our site and members portal, plus everything in the free options below.
                </p>
                <div className="mt-2.5 rounded-lg border border-brand-green/30 bg-brand-green/[0.07] px-3 py-2 text-xs leading-relaxed text-brand-green">
                  <b>🎁 BONUS:</b> Everything we make goes on our socials. We&apos;ll send you a personalised batch of content to post on your own socials too.
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-brand-purple/45 bg-brand-purple/[0.12] px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-purple-soft">Our guarantee</div>
                <div className="mt-1 text-sm font-bold leading-relaxed text-white">
                  Don&apos;t make back $1,500 in your first 60 days and we&apos;ll work with you for free until you do.
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-brand-yellow/45 bg-brand-yellow/[0.1] px-4 py-3 text-center">
                <div className="font-display text-sm font-black uppercase tracking-[0.1em] text-brand-yellow">
                  🎁 Next 3 members: buy now and get your 2nd month FREE
                </div>
                <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white/70">
                  Less than $25/day | the cheapest employee you&apos;ll ever get
                </div>
              </div>
              <a
                href="/full-suite"
                className="mt-4 flex w-full items-center justify-center rounded-full bg-brand-purple px-8 py-3.5 font-display text-sm font-black uppercase tracking-[0.12em] text-white transition hover:brightness-110 active:scale-95"
              >
                Get started →
              </a>
              <a
                href="#contact"
                className="mt-3 block text-center text-sm font-bold text-brand-purple-soft underline underline-offset-4 transition hover:text-white"
              >
                Or book a call to discuss →
              </a>
              <p className="mt-2.5 text-center text-[11px] font-semibold leading-relaxed text-brand-green">
                No lock-in contracts. Hate it? Cancel any time, and we&apos;ll send all our work across to you.
              </p>
            </div>
          </Reveal>

          {/* Platinum value anchor vs hiring */}
          <Reveal delay={40}>
            <div className="mt-6 rounded-2xl border border-brand-green/30 bg-brand-green/[0.06] px-5 py-4 text-center">
              <div className="font-display text-base font-extrabold text-white sm:text-lg">
                A full-time content creator costs $1,000+ per week.
              </div>
              <div className="mt-1 text-sm font-black uppercase tracking-[0.06em] text-brand-green">
                Save $800+ per week by using us.
              </div>
            </div>
          </Reveal>

          {/* Free partnerships */}
          <Reveal>
            <div className="mt-14 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-yellow">Not ready to spend money?</div>
              <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Try us out through a free partnership
              </h3>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {OPTIONS.map((o, i) => (
              <Reveal key={o.title} delay={i * 90}>
                <div className="flex h-full flex-col rounded-3xl border border-brand-yellow/35 bg-gradient-to-b from-brand-yellow/[0.08] to-white/[0.02] p-6 shadow-glowY">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl leading-none">{o.icon}</span>
                    <span className="rounded-full bg-brand-yellow/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-brand-yellow">
                      {o.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">{o.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{o.summary}</p>
                  <div className="mt-5 flex flex-1 flex-col gap-4 border-t border-white/10 pt-5">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-green">You give</div>
                      <div className="mt-1 text-sm leading-relaxed text-white/80">{o.give}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-yellow">You get</div>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {o.get.map((g) => (
                          <li key={g} className="flex items-start gap-2 text-sm leading-relaxed text-white/80">
                            <span className="mt-0.5 shrink-0 text-brand-green">✓</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <a
                    href="#contact"
                    className="mt-5 flex w-full items-center justify-center rounded-full bg-brand-yellow px-6 py-3 font-display text-sm font-black uppercase tracking-[0.12em] text-[#141400] transition hover:brightness-110 active:scale-95"
                  >
                    Start free →
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Scrolling logos, like the membership page, so a business can picture their logo here */}
          <Reveal delay={120}>
            <div className="mt-12">
              <div className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-brand-yellow">
                Your business, in front of our members
              </div>
              <div className="relative mt-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                <div className="flex w-max animate-marquee items-center gap-5">
                  {Array.from({ length: 2 }).flatMap((_, dup) =>
                    Array.from({ length: 6 }).map((__, i) => (
                      <div
                        key={`${dup}-${i}`}
                        className="flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl border border-brand-yellow/20 bg-white/[0.03] px-5"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={BUSINESS.logo} alt="Featured partner" className="max-h-9 w-auto opacity-85" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" className="scroll-mt-16 px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
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

    </main>
  );
}
