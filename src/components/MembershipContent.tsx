import Link from "next/link";
import Reveal from "@/components/Reveal";
import ReviewsSection from "@/components/ReviewsSection";
import SiteNav from "@/components/SiteNav";
import Countdown from "@/components/Countdown";
import DrawCard from "@/components/DrawCard";
import { BUSINESS } from "@/lib/config";

// The member draw: drawn 14 Sep 2026, 12:00pm AEST (UTC+10).
const DRAW_TIME = "2026-09-14T12:00:00+10:00";
// The current headline prize, shown in the "what could you do with…" CTA above
// the packages. Update this one line each draw (e.g. "$2,000", "a new car").
const HEADLINE_PRIZE = "$1,000";
// The weekly mini draw: drawn Sun 21 Sep 2026, 12:00pm AEST (UTC+10).
const DRAW_MINI_TIME = "2026-09-21T12:00:00+10:00";

/* Shared body for the membership pages. `bonus` toggles the free
   cut & polish banner, on for /membership (new/cold ad traffic), off for
   /plan (existing detail clients, so they don't feel they missed out).

   Branded as Smiths Detailing (green/black), the name cold ad traffic
   already recognises from 100+ Google reviews. */

const LOGO = BUSINESS.logo; // Smiths Detailing logo

// ── The "from" price (cheapest tier = Single Cab). Change this line only. ──
const PRICE = "$39";

// Purple glow used behind the hero (brand purple #7c2ff5).
const GREEN_GLOW = "radial-gradient(closest-side, #7c2ff5, transparent 70%)";
const VSL_VIDEO = "/media/videos/vsl-membership.mp4";
const YELLOW_GLOW = "radial-gradient(closest-side, #FFE600, transparent 70%)";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I go in the draws?",
    a: "Become a member and you're automatically entered into every members' draw, cash and prizes. There's nothing else to do, being a member is your entry.",
  },
  {
    q: "How much is it?",
    a: "Two easy ways in. Smiths Member is $1 for your first month, then $9.99/month, cancel anytime. Or grab the 30-Day Pass for $9.99 once (usually $24.99), no subscription, nothing renews. Both put you in every draw.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel in a couple of taps whenever you like, no lock-in and no hoops. You stay in the draws for whatever you've paid for.",
  },
  {
    q: "Are the draws actually real?",
    a: "100%. Every draw is real, we do them live, film them, and call the winner. Have a look at our winners section above, that's a real member we called.",
  },
  {
    q: "How does the draw work?",
    a: "Every active member goes in automatically. Winners are drawn at random on the draw date, and where a draw offers a choice, like cash or a detail, the winner picks. Full details are on the draw terms page linked under each draw.",
  },
  {
    q: "What else do I get as a member?",
    a: "On top of every draw entry, you get 10% off all our detailing services and priority booking. The draws are the main event, the perks are a bonus.",
  },
  {
    q: "Do I have to be local?",
    a: "You can join and go in the draws from anywhere in Australia. The 10% off and priority booking are for our Cairns detailing, so those perks suit local members best.",
  },
  {
    q: "What if I win?",
    a: "We call you, and you choose your prize where the draw gives you the option. Easy. We announce winners on our socials too.",
  },
];

type Group = { icon: string; title: string; items: string[] };

const EVERY_VISIT: Group[] = [
  {
    icon: "✨",
    title: "Deep Interior Clean",
    items: ["Vacuum", "Carpet extraction", "All interior surfaces cleaned", "Plastics rejuvenated"],
  },
  {
    icon: "🚿",
    title: "Exterior Detail",
    items: ["Wheels, tyres and mudflaps cleaned", "Full exterior contact wash", "Tyre shine", "Windows streak free"],
  },
  {
    icon: "🩺",
    title: "Top-Up & Health Check",
    items: [
      "All fluids topped up",
      "Tyre pressure checked",
      "Battery health checked",
      "Brakes checked",
      "Tyres checked for wear",
      "Lights checked",
      "Quick check for leaks",
    ],
  },
];

const EVERY_6_MONTHS: Group[] = [
  {
    icon: "🔧",
    title: "Full Service",
    items: ["Oil change and new oil filter", "Air filter blown out", "Wiper blades checked, swapped if needed"],
  },
];




function Stars() {
  return (
    <span className="text-brand-purple-soft" aria-label="5 out of 5 stars">
      ★★★★★
    </span>
  );
}

function GroupCard({ g }: { g: Group }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2.5">
        <span className="text-xl leading-none">{g.icon}</span>
        <h3 className="font-display text-lg font-extrabold tracking-tight text-white">{g.title}</h3>
      </div>
      <ul className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {g.items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-white/75">
            <span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MembershipContent() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ═══ NAV ═══ */}
      <SiteNav cta={{ label: "Join now", href: "#join" }} accent="purple" />

      {/* ═══ HERO = MEMBERS' DRAWS ═══ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[6%] h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{ background: YELLOW_GLOW }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[40%] h-[360px] w-[360px] -translate-x-1/2 rounded-full opacity-[0.10] blur-[100px]"
          style={{ background: GREEN_GLOW }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-12 sm:pt-16">
          <Reveal delay={200}>
            <div className="mt-6 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Members&apos; draws</div>
              <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                The best <span className="text-brand-green">$1</span> you will ever spend
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
                Join now, you&apos;re in <span className="text-brand-purple-soft">every draw</span>.
              </p>
            </div>
          </Reveal>

          <div className="mt-9 grid gap-6 md:grid-cols-2">
            {/* big draw */}
            <Reveal>
              <DrawCard
                poster="/media/photos/giveaway.jpg"
                alt="Smiths Detailing members' giveaway, win $1,000 cash or a $2,200 paint correction and ceramic coating"
                label="Big draw · drawn 14 Sept"
                title={<>Win <span className="text-brand-purple-soft">$1,000 cash</span> or a <span className="text-brand-purple-soft">$2,200</span> paint correction &amp; coating</>}
                blurb="Every active member is automatically entered. Join now and you are in."
                target={DRAW_TIME}
                termsHref="/draw-terms"
              />
            </Reveal>

            {/* mini draw */}
            <Reveal delay={100}>
              <DrawCard
                poster="/media/photos/mini-giveaway.jpg"
                alt="Smiths members' mini draw, win $300 cash or a $400+ detail"
                label="Mini draw · drawn 21 Sept"
                title={<>Win <span className="text-brand-purple-soft">$300 cash</span> or a <span className="text-brand-purple-soft">$400+</span> detail</>}
                blurb="A small member pool right now means the best odds you will ever get. Join and you're in."
                target={DRAW_MINI_TIME}
                termsHref="/mini-draw-terms"
              />
            </Reveal>
          </div>

          {/* Scrolling announcement ticker, under the posters */}
          <Reveal delay={150}>
            <div className="mt-8 overflow-hidden rounded-full border border-brand-purple/50 bg-gradient-to-r from-brand-purple to-brand-purple-soft py-2.5 shadow-[0_0_44px_-12px_rgba(124,47,245,0.8)]">
              <div className="flex w-max animate-marquee items-center whitespace-nowrap">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="flex items-center text-[12.5px] font-black uppercase tracking-[0.14em] text-white sm:text-[13px]">
                    <span>This week only · all new members get 30% off all detailing services</span>
                    <span className="px-6 text-white/55">✦</span>
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-9 flex justify-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70">
                <Stars />
                <span><b className="font-bold text-white">100+</b> 5-star reviews · cancel anytime</span>
              </div>
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center font-display text-xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl">
              The big national clubs? You&apos;re <span className="text-white/45">1 in 300,000</span>.
              <br className="hidden sm:block" /> Smiths right now? You&apos;re <span className="text-brand-green">1 in a handful</span>.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ WINNERS ═══ */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Real winners</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                We actually pay out
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60">
                Every draw is real and every winner gets the call. Here&apos;s the moment we told our latest member they&apos;d won.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-7 flex touch-pan-x snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-2 sm:justify-center sm:overflow-visible">
              {[
                { src: "/media/videos/winner-mini-draw.mp4", poster: "/media/photos/winner-poster.jpg" },
                { src: "/media/videos/winner-2.mp4", poster: "/media/photos/winner-2-poster.jpg" },
              ].map((v) => (
                <div key={v.src} className="relative w-[72vw] max-w-[280px] shrink-0 snap-center sm:w-[280px]">
                  <div
                    className="pointer-events-none absolute -inset-4 rounded-[2rem] opacity-40 blur-2xl"
                    style={{ background: GREEN_GLOW }}
                    aria-hidden
                  />
                  <div className="relative overflow-hidden rounded-2xl border border-brand-purple/40 bg-black shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)]">
                    <video
                      src={v.src}
                      poster={v.poster}
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-[9/16] w-full bg-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ THE PLAN ═══ */}
      <section id="join" className="scroll-mt-16 pt-10 pb-6 sm:pt-12">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal>
            <div className="mx-auto mb-7 max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                What could you do with an extra <span className="text-brand-green">{HEADLINE_PRIZE}</span> this week?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">
                Join for $1 and you&apos;re in the draw. Every member&apos;s in it, automatically.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-5 py-4 text-center shadow-glowY">
              <p className="font-display text-base font-black leading-snug tracking-tight text-brand-yellow sm:text-lg">
                We only have a handful of members right now, the best odds you&apos;ll ever get.
              </p>
            </div>
          </Reveal>
          <div className="mb-6 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-purple-soft">Choose your plan</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Card 1: Smiths Member $1 first month — purple — Most popular */}
            <Reveal>
              <div className="relative flex h-full flex-col rounded-3xl border border-brand-purple/50 bg-gradient-to-b from-brand-purple/[0.16] to-white/[0.02] p-6 shadow-[0_14px_60px_-18px_rgba(124,47,245,0.5)]">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-purple px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">Most popular</span>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">Start here</div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-purple/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-brand-purple-soft">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-brand-purple-soft" />Limited time
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-white">Smiths Member</h3>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="mb-1.5 font-display text-xl font-bold text-red-400 line-through">$9.99</span>
                    <span className="font-display text-4xl font-black text-white">$1</span>
                    <span className="mb-1.5 text-xs font-bold text-white/50">first month</span>
                  </div>
                  <div className="mt-1.5 inline-flex items-center rounded-full bg-brand-purple/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-purple-soft">
                    First month 90% off
                  </div>
                  <div className="mt-1.5 text-xs text-white/45">then $9.99/month · cancel anytime</div>
                </div>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>10% off all our detailing</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>Priority booking</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span><span className="text-brand-yellow">1 free entry into every draw</span></li>
                </ul>
                <a href="https://buy.stripe.com/8x27sL07CaTX8eI35F6kg0z" className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-purple px-6 py-3.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95">
                  Join for $1 →
                </a>
                <p className="mt-2.5 flex min-h-[2.5rem] items-start justify-center text-center text-xs text-white/40">First month $1, then $9.99/month. Cancel anytime.</p>
              </div>
            </Reveal>

            {/* Card 2: Annual $99/year — yellow — Best value */}
            <Reveal delay={80}>
              <div className="relative flex h-full flex-col rounded-3xl border border-brand-yellow/45 bg-gradient-to-b from-brand-yellow/[0.08] to-white/[0.02] p-6 shadow-glowY">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-yellow px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-brand-ink">Best value</span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-yellow">Yearly</div>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-white">Annual Member</h3>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="font-display text-4xl font-black text-white">$99</span>
                    <span className="mb-1.5 text-xs font-bold text-white/50">/year</span>
                  </div>
                  <div className="mt-1.5 inline-flex items-center rounded-full bg-brand-yellow/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-yellow">
                    Save $20.88
                  </div>
                  <div className="mt-1.5 text-xs text-white/45">a year of membership, paid once</div>
                </div>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">✓</span>10% off all our detailing</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">✓</span>Priority booking</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span><span className="text-brand-yellow">5 free entries into every draw</span></li>
                </ul>
                <a href="https://buy.stripe.com/4gM3cv6w02nr52w49J6kg0D" className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-yellow px-6 py-3.5 font-display text-sm font-black text-brand-ink transition hover:brightness-110 active:scale-95">
                  Get the year · $99 →
                </a>
                <p className="mt-2.5 flex min-h-[2.5rem] items-start justify-center text-center text-xs text-white/40">One payment a year. 5x the draw entries.</p>
              </div>
            </Reveal>

            {/* Card 3: 30-Day Pass one-off — black/neutral */}
            <Reveal delay={160}>
              <div className="flex h-full flex-col rounded-3xl border border-white/25 bg-gradient-to-b from-white/[0.07] to-white/[0.01] p-6 shadow-[0_14px_50px_-22px_rgba(255,255,255,0.28)]">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">No subscription</div>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-white">30-Day Pass</h3>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="mb-1.5 font-display text-xl font-bold text-red-400 line-through">$24.99</span>
                    <span className="font-display text-4xl font-black text-white">$9.99</span>
                    <span className="mb-1.5 text-xs font-bold text-white/50">once</span>
                  </div>
                  <div className="mt-1.5 text-xs text-white/45">30 days of membership, nothing renews</div>
                </div>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>10% off all our detailing</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>Priority booking</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span><span className="text-brand-yellow">1 free entry into every draw</span></li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>Valid 30 days, no renewal</li>
                </ul>
                <a href="https://buy.stripe.com/fZueVdbQkbY166A8pZ6kg0H" className="mt-6 flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 font-display text-sm font-black text-brand-ink transition hover:brightness-95 active:scale-95">
                  Get the pass · $9.99 →
                </a>
                <p className="mt-2.5 flex min-h-[2.5rem] items-start justify-center text-center text-xs text-white/40">One-off. Nothing renews.</p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <p className="mx-auto mt-7 max-w-xl text-center font-display text-base font-black leading-snug tracking-tight text-brand-green sm:text-lg">
              10% off detailing saves you up to $230 on one detail. That&apos;s $230 back, for $1. Worth it?
            </p>
          </Reveal>

          <Reveal>
            <p className="mx-auto mt-4 max-w-xl text-center text-xs leading-relaxed text-white/40">
              Every plan is a membership with real perks, entries into the draws come free with it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ PARTNER DISCOUNTS (coming soon) ═══ */}
      <section className="px-4 pt-14 sm:pt-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-purple/40 bg-brand-purple/[0.12] px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-brand-purple-soft">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-purple-soft" />Coming soon
              </div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Member discounts at local businesses
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60">
                We&apos;re bringing local businesses on board so your membership saves you money all over Cairns.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="flex w-max animate-marquee items-center gap-5">
                {Array.from({ length: 2 }).flatMap((_, dup) =>
                  Array.from({ length: 6 }).map((__, i) => (
                    <div
                      key={`${dup}-${i}`}
                      className="flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl border border-brand-purple/20 bg-white/[0.03] px-5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={LOGO} alt="Smiths Detailing, featured partner" className="max-h-9 w-auto opacity-85" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="px-4 pt-16 pb-6 sm:pt-20 sm:pb-8">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Questions</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Everything you might ask
              </h2>
            </div>
          </Reveal>
          <div className="mt-8 grid items-start gap-3 sm:grid-cols-2">
            {FAQS.map((f) => (
              <Reveal key={f.q}>
                <details className="group rounded-2xl border border-brand-purple/20 bg-white/[0.02] transition hover:border-brand-purple/40 open:border-brand-purple/50 open:bg-brand-purple/[0.05]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-base font-bold text-white [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand-purple/40 text-brand-purple-soft transition group-open:rotate-45 group-open:border-brand-purple group-open:bg-brand-purple group-open:text-white">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-[15px] leading-relaxed text-white/65">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-8 text-center text-sm text-white/50">
              Still unsure?{" "}
              <a href={`sms:${BUSINESS.phoneE164}`} className="font-bold text-brand-purple-soft underline underline-offset-4 transition hover:text-white">
                Text Thanyon
              </a>{" "}
              and ask.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <ReviewsSection accent="purple" />

      {/* ═══ BUSINESS OWNER CTA ═══ */}
      <section className="px-4 pb-14 pt-4 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-purple/25 bg-gradient-to-br from-brand-purple/[0.12] to-white/[0.02] px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">Own a business?</div>
                <h3 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                  Get in front of our members
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-white/60">
                  Feature in a giveaway or offer a member discount. Real local exposure, no ad spend.
                </p>
              </div>
              <Link
                href="/partners"
                className="shrink-0 rounded-full bg-brand-purple px-7 py-3 font-display text-sm font-black uppercase tracking-[0.12em] text-white transition hover:brightness-110 active:scale-95"
              >
                Click here
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}
