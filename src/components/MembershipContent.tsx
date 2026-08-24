import Link from "next/link";
import Reveal from "@/components/Reveal";
import ReviewsSection from "@/components/ReviewsSection";
import SiteNav from "@/components/SiteNav";
import Countdown from "@/components/Countdown";
import MembershipCheckout from "@/components/MembershipCheckout";
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
const HERO_IMG = "/media/photos/cutpolish.jpg";
const EXPLAINER_VIDEO = "/media/videos/membership-explainer.mp4";

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
    q: "What's the difference between the two plans?",
    a: "The full membership means we actually detail and service your car on a schedule, it's hands-off car care. Smiths Member at $9.99/month is perks only: 10% off, priority booking and draw entry, with no detailing done for you. Most people who want their car handled choose the full membership.",
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



function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">{children}</div>;
}

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

      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[82vh] items-center overflow-hidden">
        {/* full-bleed photo + darkening overlay for legible centered text */}
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${HERO_IMG})`, backgroundPosition: "72% center" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#050506]/80" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-[22%] h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-[0.20] blur-[120px]"
          style={{ background: GREEN_GLOW }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[44%] h-[320px] w-[320px] -translate-x-1/2 rounded-full opacity-[0.10] blur-[100px]"
          style={{ background: YELLOW_GLOW }}
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050506] to-transparent" aria-hidden />

        <div className="relative mx-auto w-full max-w-3xl px-5 py-14 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
              Founding members · Cairns · 10 spots left
            </span>
          </Reveal>
          <Reveal delay={100}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Detailing" className="mx-auto mt-7 w-full max-w-xs sm:max-w-sm" />
          </Reveal>
          <Reveal delay={200}>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Hand us the keys.
              <span className="text-brand-green"> Never think about your car again.</span>
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-white/70">
              Your car detailed and serviced on a schedule, all handled for you.
            </p>
          </Reveal>
          <Reveal delay={350}>
            <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2.5">
              {[
                "✨ Full detail every 3 months",
                "🔧 Full service every 6 months",
                "🎁 Free Cut & Polish to start",
                "💰 Entry to member draws",
              ].map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-sm font-semibold text-white/85"
                >
                  {p}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={350}>
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70">
              <Stars />
              <span><b className="font-bold text-white">100+</b> 5-star Google reviews</span>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-8">
              <a
                href="#join"
                className="inline-flex rounded-full bg-brand-green px-8 py-4 font-display text-base font-extrabold text-brand-ink shadow-[0_10px_40px_rgba(43,255,122,0.25)] transition hover:brightness-110 active:scale-95"
              >
                Join now →
              </a>
              <p className="mt-3 text-xs text-white/40">Next <s className="text-white/30">15</s> 10 members get a free Cut &amp; Polish · cancel anytime</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ MINI DRAW (this week) ═══ */}
      <section className="pt-10 pb-4">
        <div className="mx-auto max-w-2xl px-4">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
                Drawn this Saturday
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                This week&apos;s <span className="text-brand-yellow">members&apos; draw</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-6 overflow-hidden rounded-2xl border border-brand-yellow/40 shadow-glowY">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/photos/mini-giveaway.png"
                  alt="Smiths members' mini draw, win $300 cash or a $400+ detail"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="bg-gradient-to-br from-brand-yellow/[0.14] to-brand-yellow/[0.02] p-5 text-center sm:p-6">
                <p className="mx-auto max-w-md text-sm leading-relaxed text-white/80">
                  We just launched, so your odds have never been better. Join now and you&apos;re in
                  this week&apos;s draw, plus the big $1,000 draw on 14 Sept.
                </p>
                <div className="mt-4">
                  <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-yellow/80">
                    Drawn in
                  </div>
                  <Countdown target={DRAW_MINI_TIME} />
                </div>
                <a
                  href="#join"
                  className="mt-5 inline-flex rounded-full bg-brand-green px-7 py-3.5 font-display text-sm font-black text-brand-ink shadow-[0_10px_40px_rgba(43,255,122,0.25)] transition hover:brightness-110 active:scale-95"
                >
                  Join now, get in this week&apos;s draw →
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ GIVEAWAY PROMO ═══ */}
      <section className="py-10">
        <div className="mx-auto max-w-2xl px-4">
          <Reveal>
            <h2 className="mb-5 text-center font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              The big <span className="text-brand-yellow">members&apos; draw</span>
            </h2>
          </Reveal>
          <Reveal>
            <Link
              href="/draw-terms"
              className="group block overflow-hidden rounded-2xl border border-brand-yellow/40 shadow-glowY transition hover:border-brand-yellow/60"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/photos/giveaway.png"
                  alt="Smiths Detailing members' giveaway, win $1,000 cash or a $2,200 paint correction and ceramic coating"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="bg-gradient-to-br from-brand-yellow/[0.14] to-brand-yellow/[0.02] p-5 sm:p-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-yellow">
                  Members&apos; draw · drawn 14 Sept
                </div>
                <h3 className="mt-1.5 font-display text-xl font-extrabold leading-tight text-white sm:text-2xl">
                  Win <span className="text-brand-yellow">$1,000 cash</span> or a{" "}
                  <span className="text-brand-yellow">$2,200</span> paint correction &amp; coating
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Every active member is automatically entered. Join now and you&apos;re in.
                </p>
                <div className="mt-4">
                  <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-yellow/80">
                    Drawn in
                  </div>
                  <Countdown target={DRAW_TIME} />
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-yellow group-hover:text-white">
                  See draw terms
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ HOW IT WORKS (video) ═══ */}
      <section className="border-y border-white/5 bg-white/[0.015] py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <Reveal>
            <Eyebrow>Watch</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              How it works, straight from us
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative mx-auto mt-8 w-full max-w-[300px]">
              <div
                className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-40 blur-2xl"
                style={{ background: GREEN_GLOW }}
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-black shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)]">
                <video
                  src={EXPLAINER_VIDEO}
                  poster="/media/photos/membership-explainer-poster.jpg"
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] w-full bg-black object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ THE PLAN ═══ */}
      <section id="join" className="scroll-mt-16 pt-20 pb-6 sm:pt-24">
        <div className="mx-auto max-w-2xl px-4">
          {bonus && (
            <Reveal>
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-brand-yellow/45 bg-gradient-to-r from-brand-yellow/[0.14] to-brand-yellow/[0.03] px-5 py-4 shadow-glowY">
                <span className="text-2xl leading-none">🎁</span>
                <div className="min-w-0">
                  <div className="font-display text-[15px] font-extrabold leading-tight text-white sm:text-lg">
                    BONUS: Get a free Cut &amp; Polish <span className="whitespace-nowrap text-brand-yellow">valued at $750+</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-yellow/80">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-yellow"></span>
                    Next <s className="opacity-60">15</s> 10 members only
                  </div>
                </div>
              </div>
            </Reveal>
          )}
          {/* two tiers, swipe between them */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">Choose your plan</span>
            <span className="flex items-center gap-1.5 rounded-full border border-brand-green/40 bg-brand-green/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-green sm:hidden">
              Swipe <span className="animate-pulse" aria-hidden>→</span>
            </span>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin]">
            {/* Full membership: value stack + pick your vehicle */}
            <div className="w-[84%] shrink-0 snap-center sm:w-[64%]">
              <Reveal>
                <MembershipCheckout />
              </Reveal>
            </div>

            {/* Smiths Member: $9.99/mo, perks + draw entry */}
            <div className="w-[84%] shrink-0 snap-center sm:w-[64%]">
              <Reveal delay={80}>
                <div className="flex h-full flex-col rounded-3xl border border-brand-yellow/45 bg-gradient-to-b from-brand-yellow/[0.08] to-white/[0.02] p-6 shadow-glowY sm:p-8">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">The lighter way in</div>
                    <h3 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-white">Smiths Member</h3>
                    <p className="mt-1 text-sm text-white/55">Just want the perks and a shot at the draws?</p>
                  </div>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    <li className="flex items-start gap-2.5 text-sm text-white/80"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>10% off all our services</li>
                    <li className="flex items-start gap-2.5 text-sm text-white/80"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>Priority booking</li>
                    <li className="flex items-start gap-2.5 text-sm text-white/80"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span><span className="text-brand-yellow">Entry to win $1,000 cash or $2,200 detail <span className="text-white/45">· drawn 14 Sept</span></span></li>
                  </ul>
                  <a
                    href="https://buy.stripe.com/8x27sL07CaTX8eI35F6kg0z"
                    className="mt-8 flex w-full items-center justify-center rounded-full bg-brand-green px-6 py-3.5 font-display text-sm font-black text-brand-ink transition hover:brightness-110 active:scale-95"
                  >
                    Join · $9.99/month →
                  </a>
                  <p className="mt-2.5 text-center text-xs text-white/40">Perks and draw entry, no detailing done for you. Cancel anytime.</p>
                </div>
              </Reveal>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-center gap-2" aria-hidden>
            <span className="h-1.5 w-6 rounded-full bg-brand-green/70"></span>
            <span className="h-1.5 w-6 rounded-full bg-brand-yellow/70"></span>
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
