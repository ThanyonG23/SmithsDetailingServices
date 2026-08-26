import Link from "next/link";
import Reveal from "@/components/Reveal";
import ReviewsSection from "@/components/ReviewsSection";
import SiteNav from "@/components/SiteNav";
import Countdown from "@/components/Countdown";
import { BUSINESS } from "@/lib/config";

// The member draw: drawn 14 Sep 2026, 12:00pm AEST (UTC+10).
const DRAW_TIME = "2026-09-14T12:00:00+10:00";
// The weekly mini draw: drawn Sat 5 Sep 2026, 12:00pm AEST (UTC+10).
const DRAW_MINI_TIME = "2026-09-05T12:00:00+10:00";

/* Shared body for the membership pages. `bonus` toggles the free
   cut & polish banner, on for /membership (new/cold ad traffic), off for
   /plan (existing detail clients, so they don't feel they missed out).

   Branded as Smiths Detailing (green/black), the name cold ad traffic
   already recognises from 100+ Google reviews. */

const LOGO = BUSINESS.logo; // Smiths Detailing logo

// ── The "from" price (cheapest tier = Single Cab). Change this line only. ──
const PRICE = "$39";

// Green glow used behind the hero + plan card (brand green #2bff7a).
const GREEN_GLOW = "radial-gradient(closest-side, #2bff7a, transparent 70%)";
const YELLOW_GLOW = "radial-gradient(closest-side, #FFE600, transparent 70%)";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What exactly do I get?",
    a: "A full detail every 3 months and a full service every 6 months, so your car stays clean and looked after all year. You also get a free Cut & Polish to start, 10% off any add-on services, priority booking, and entry to the members' draw. One simple weekly payment covers it all.",
  },
  {
    q: "How does payment work?",
    a: "It's a weekly subscription from $39/week, depending on your vehicle size, plus a one-off first-visit fee that covers your first full detail and Cut & Polish. Secure checkout through Stripe, and you can cancel anytime.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, anytime. The member price is built around you staying on the plan, so if you cancel before your second visit the first visit is simply charged at our normal going rate. Stay past that and you keep the member pricing for good.",
  },
  {
    q: "What's the difference between the plans?",
    a: "There are three. Detail & Vehicle Service is the full membership: we actually detail and service your car on a schedule, it's hands-off car care, from $39/week. Smiths Member ($9.99/month) is the lighter, cheaper way in, perks and draws only, no detailing. The 30-Day Pass ($24.99 once) is the same perks and draws but paid one-off with no subscription. Most people who want their car handled choose Detail & Vehicle Service.",
  },
  {
    q: "What is the $9.99/month Smiths Member plan?",
    a: "It's the cheapest way to become a member without booking in a detail. For $9.99/month you get 10% off all our services, priority booking, and entry to every members' draw. We don't detail your car on this plan, it's the perks and the draws only. Great if you just want to be in the giveaways and save on the odd detail.",
  },
  {
    q: "Can I do a one-off instead of a subscription?",
    a: "Yes. The 30-day Member Pass is $24.99 once, no subscription and nothing renews. It gives you the same 10% off, priority booking, and entry to every draw for 30 days from your purchase. There's a link for it under the Smiths Member plan. Handy if you'd rather not have a recurring payment.",
  },
  {
    q: "How does the $1,000 draw work?",
    a: "Every active member is automatically entered to win $1,000 cash, drawn 14 September. Nothing extra to do, being a member is your entry. Full details are on the draw terms page.",
  },
  {
    q: "Where are you based?",
    a: `Our workshop is at ${BUSINESS.address}. You drop the car with us and we handle the rest.`,
  },
  {
    q: "What if I'm not happy?",
    a: "Simple: if you're not happy with the work, you don't pay. We've got 100+ five-star reviews because we don't hand a car back until it's right.",
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
    <span className="text-brand-green" aria-label="5 out of 5 stars">
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
            <span className="mt-0.5 shrink-0 text-brand-green">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MembershipContent({ bonus = false }: { bonus?: boolean }) {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ═══ NAV ═══ */}
      <SiteNav cta={{ label: "Join now", href: "#join" }} />

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
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
                Founding members · we just launched
              </span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Detailing" className="mx-auto mt-6 w-full max-w-[210px] sm:max-w-xs" />
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-6 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-green">Members&apos; draws</div>
              <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Join now, you&apos;re in <span className="text-brand-yellow">both draws</span>
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
                We just launched, so your odds have never been better. Every member goes in every draw, automatically.
              </p>
            </div>
          </Reveal>

          <div className="mt-9 grid gap-6 md:grid-cols-2">
            {/* mini draw */}
            <Reveal>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-yellow/40 shadow-glowY">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/media/photos/mini-giveaway.png"
                    alt="Smiths members' mini draw, win $300 cash or a $400+ detail"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col bg-gradient-to-br from-brand-yellow/[0.14] to-brand-yellow/[0.02] p-5 sm:p-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-yellow">
                    Mini draw · drawn 5 Sept
                  </div>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold leading-tight text-white sm:text-2xl">
                    Win <span className="text-brand-yellow">$300 cash</span> or a{" "}
                    <span className="text-brand-yellow">$400+</span> detail
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Our first mini draw. A brand new member pool means the best odds you will ever get.
                  </p>
                  <div className="mt-auto pt-4">
                    <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-yellow/80">
                      Drawn in
                    </div>
                    <Countdown target={DRAW_MINI_TIME} />
                    <a
                      href="#join"
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-green px-6 py-3 font-display text-sm font-black text-brand-ink shadow-[0_10px_40px_rgba(43,255,122,0.25)] transition hover:brightness-110 active:scale-95"
                    >
                      Join now →
                    </a>
                    <Link
                      href="/mini-draw-terms"
                      className="mt-3 block text-center text-xs font-semibold text-brand-yellow/80 underline underline-offset-4 transition hover:text-white"
                    >
                      See draw terms
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* big draw */}
            <Reveal delay={100}>
              <Link
                href="/draw-terms"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-yellow/40 shadow-glowY transition hover:border-brand-yellow/60"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/media/photos/giveaway.png"
                    alt="Smiths Detailing members' giveaway, win $1,000 cash or a $2,200 paint correction and ceramic coating"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col bg-gradient-to-br from-brand-yellow/[0.14] to-brand-yellow/[0.02] p-5 sm:p-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-yellow">
                    Big draw · drawn 14 Sept
                  </div>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold leading-tight text-white sm:text-2xl">
                    Win <span className="text-brand-yellow">$1,000 cash</span> or a{" "}
                    <span className="text-brand-yellow">$2,200</span> paint correction &amp; coating
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Every active member is automatically entered. Join now and you are in.
                  </p>
                  <div className="mt-auto pt-4">
                    <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-yellow/80">
                      Drawn in
                    </div>
                    <Countdown target={DRAW_TIME} />
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-yellow group-hover:text-white">
                      See draw terms
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-9 flex flex-col items-center gap-4">
              <a
                href="#join"
                className="inline-flex rounded-full bg-brand-green px-8 py-4 font-display text-base font-extrabold text-brand-ink shadow-[0_10px_40px_rgba(43,255,122,0.25)] transition hover:brightness-110 active:scale-95"
              >
                Join now →
              </a>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70">
                <Stars />
                <span><b className="font-bold text-white">100+</b> 5-star reviews · cancel anytime</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ THE PLAN ═══ */}
      <section id="join" className="scroll-mt-16 pt-20 pb-6 sm:pt-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">Choose your plan</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Card 1: Detail & Vehicle Service (full membership) — purple */}
            <Reveal>
              <div className="relative flex h-full flex-col rounded-3xl border border-brand-purple/50 bg-gradient-to-b from-brand-purple/[0.16] to-white/[0.02] p-6 shadow-[0_14px_60px_-18px_rgba(124,47,245,0.5)]">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-purple px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">Most popular</span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">The full membership</div>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-white">Detail &amp; Vehicle Service</h3>
                  <div className="mt-3 flex items-end gap-1.5">
                    <span className="mb-1 text-xs font-bold text-white/50">From</span>
                    <span className="font-display text-3xl font-black text-white">$39</span>
                    <span className="mb-1 text-xs font-bold text-white/50">/week</span>
                  </div>
                </div>
                {bonus && (
                  <div className="mt-4 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-3 py-2.5 text-center">
                    <div className="text-[11px] font-black uppercase tracking-wide text-brand-yellow">🎁 Free Cut &amp; Polish to start</div>
                    <div className="mt-0.5 text-[11px] text-white/60">Valued at $750+ · next <s className="opacity-60">15</s> 10 members</div>
                  </div>
                )}
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>Full detail every 3 months</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>Full service every 6 months</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>10% off add-on services</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>Priority booking</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span><span className="text-brand-yellow">Entry to every draw</span></li>
                </ul>
                <a href="/membership/join" className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-purple px-6 py-3.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95">
                  Choose your vehicle →
                </a>
                <p className="mt-2.5 flex min-h-[2.5rem] items-start justify-center text-center text-xs text-white/40">Pick your vehicle at checkout. Cancel anytime.</p>
              </div>
            </Reveal>

            {/* Card 2: Smiths Member $9.99/mo */}
            <Reveal delay={80}>
              <div className="flex h-full flex-col rounded-3xl border border-brand-yellow/45 bg-gradient-to-b from-brand-yellow/[0.08] to-white/[0.02] p-6 shadow-glowY">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">The lighter way in</div>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-white">Smiths Member</h3>
                  <div className="mt-3 flex items-end gap-1.5">
                    <span className="font-display text-3xl font-black text-white">$9.99</span>
                    <span className="mb-1 text-xs font-bold text-white/50">/month</span>
                  </div>
                </div>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">✓</span>10% off all our services</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">✓</span>Priority booking</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span><span className="text-brand-yellow">Entry to every draw</span></li>
                </ul>
                <a href="https://buy.stripe.com/8x27sL07CaTX8eI35F6kg0z" className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-yellow px-6 py-3.5 font-display text-sm font-black text-brand-ink transition hover:brightness-110 active:scale-95">
                  Join · $9.99/month →
                </a>
                <p className="mt-2.5 flex min-h-[2.5rem] items-start justify-center text-center text-xs text-white/40">Perks and draws, no detailing done for you. Cancel anytime.</p>
              </div>
            </Reveal>

            {/* Card 3: 30-Day Pass $24.99 one-off — black/neutral */}
            <Reveal delay={160}>
              <div className="flex h-full flex-col rounded-3xl border border-white/25 bg-gradient-to-b from-white/[0.07] to-white/[0.01] p-6 shadow-[0_14px_50px_-22px_rgba(255,255,255,0.28)]">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">No subscription</div>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-white">30-Day Pass</h3>
                  <div className="mt-3 flex items-end gap-1.5">
                    <span className="font-display text-3xl font-black text-white">$24.99</span>
                    <span className="mb-1 text-xs font-bold text-white/50">once</span>
                  </div>
                </div>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>10% off all our services</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>Priority booking</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span><span className="text-brand-yellow">Entry to every draw</span></li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>Valid 30 days, no renewal</li>
                </ul>
                <a href="https://buy.stripe.com/5kQaEX6w0bY19iM9u36kg0A" className="mt-6 flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 font-display text-sm font-black text-brand-ink transition hover:brightness-95 active:scale-95">
                  Get the pass · $24.99 →
                </a>
                <p className="mt-2.5 flex min-h-[2.5rem] items-start justify-center text-center text-xs text-white/40">One-off. Nothing renews.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-green">Questions</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Everything you might ask
              </h2>
            </div>
          </Reveal>
          <div className="mt-8 flex flex-col gap-3">
            {FAQS.map((f) => (
              <Reveal key={f.q}>
                <details className="group rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-white/20 open:border-brand-green/30 open:bg-brand-green/[0.03]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-base font-bold text-white [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/60 transition group-open:rotate-45 group-open:border-brand-green/50 group-open:text-brand-green">
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
              <a href={`sms:${BUSINESS.phoneE164}`} className="font-bold text-brand-green underline underline-offset-4 transition hover:text-white">
                Text Thanyon
              </a>{" "}
              and ask.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <ReviewsSection />

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths Detailing" className="mx-auto h-12 w-auto" />
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
