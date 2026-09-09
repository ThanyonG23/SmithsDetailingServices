import Link from "next/link";
import Reveal from "@/components/Reveal";
import ReviewsSection from "@/components/ReviewsSection";
import SiteNav from "@/components/SiteNav";
import Countdown from "@/components/Countdown";
import { BUSINESS } from "@/lib/config";

// The member draw: drawn 14 Sep 2026, 12:00pm AEST (UTC+10).
const DRAW_TIME = "2026-09-14T12:00:00+10:00";
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
          <Reveal delay={100}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Detailing" className="mx-auto mt-6 w-full max-w-[210px] sm:max-w-xs" />
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-6 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Members&apos; draws</div>
              <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Join now, you&apos;re in <span className="text-brand-purple-soft">both draws</span>
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
                We just launched, so your odds have never been better. Every member goes in every draw, automatically.
              </p>
            </div>
          </Reveal>

          <div className="mt-9 grid gap-6 md:grid-cols-2">
            {/* mini draw */}
            <Reveal>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-purple/40 shadow-[0_0_0_1px_rgba(124,47,245,0.2),0_0_55px_rgba(124,47,245,0.32)]">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/media/photos/mini-giveaway.jpg"
                    alt="Smiths members' mini draw, win $300 cash or a $400+ detail"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col bg-gradient-to-br from-brand-purple/[0.16] to-brand-purple/[0.02] p-5 sm:p-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">
                    Mini draw · drawn 21 Sept
                  </div>
                  <h3 className="mt-1.5 min-h-[3.25rem] font-display text-xl font-extrabold leading-tight text-white sm:min-h-[3.75rem] sm:text-2xl">
                    Win <span className="text-brand-purple-soft">$300 cash</span> or a{" "}
                    <span className="text-brand-purple-soft">$400+</span> detail
                  </h3>
                  <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-white/70">
                    A small member pool right now means the best odds you will ever get. Join and you&apos;re in.
                  </p>
                  <div className="mt-auto pt-4">
                    <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-purple-soft">
                      Drawn in
                    </div>
                    <Countdown target={DRAW_MINI_TIME} accent="purple" />
                    <Link
                      href="/mini-draw-terms"
                      className="mt-3 block text-center text-xs font-semibold text-brand-purple-soft underline underline-offset-4 transition hover:text-white"
                    >
                      See draw terms
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* big draw */}
            <Reveal delay={100}>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-purple/40 shadow-[0_0_0_1px_rgba(124,47,245,0.2),0_0_55px_rgba(124,47,245,0.32)]">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/media/photos/giveaway.jpg"
                    alt="Smiths Detailing members' giveaway, win $1,000 cash or a $2,200 paint correction and ceramic coating"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col bg-gradient-to-br from-brand-purple/[0.16] to-brand-purple/[0.02] p-5 sm:p-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">
                    Big draw · drawn 14 Sept
                  </div>
                  <h3 className="mt-1.5 min-h-[3.25rem] font-display text-xl font-extrabold leading-tight text-white sm:min-h-[3.75rem] sm:text-2xl">
                    Win <span className="text-brand-purple-soft">$1,000 cash</span> or a{" "}
                    <span className="text-brand-purple-soft">$2,200</span> paint correction &amp; coating
                  </h3>
                  <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-white/70">
                    Every active member is automatically entered. Join now and you are in.
                  </p>
                  <div className="mt-auto pt-4">
                    <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-purple-soft">
                      Drawn in
                    </div>
                    <Countdown target={DRAW_TIME} accent="purple" />
                    <Link
                      href="/draw-terms"
                      className="mt-3 block text-center text-xs font-semibold text-brand-purple-soft underline underline-offset-4 transition hover:text-white"
                    >
                      See draw terms
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-9 flex justify-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70">
                <Stars />
                <span><b className="font-bold text-white">100+</b> 5-star reviews · cancel anytime</span>
              </div>
            </div>
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
            <div className="relative mx-auto mt-7 max-w-[300px]">
              <div
                className="pointer-events-none absolute -inset-4 rounded-[2rem] opacity-40 blur-2xl"
                style={{ background: GREEN_GLOW }}
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-brand-purple/40 bg-black shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)]">
                <video
                  src="/media/videos/winner-mini-draw.mp4"
                  poster="/media/photos/winner-poster.jpg"
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] w-full bg-black"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ THE PLAN ═══ */}
      <section id="join" className="scroll-mt-16 pt-10 pb-6 sm:pt-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-6 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-purple-soft">Choose your plan</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>10% off all our services</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>Priority booking</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span><span className="text-brand-yellow">Entry to every draw</span></li>
                </ul>
                <a href="https://buy.stripe.com/8x27sL07CaTX8eI35F6kg0z" className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-purple px-6 py-3.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95">
                  Join for $1 →
                </a>
                <p className="mt-2.5 flex min-h-[2.5rem] items-start justify-center text-center text-xs text-white/40">First month $1, then $9.99/month. Cancel anytime.</p>
              </div>
            </Reveal>

            {/* Card 2: 30-Day Pass $24.99 one-off — black/neutral */}
            <Reveal delay={80}>
              <div className="flex h-full flex-col rounded-3xl border border-white/25 bg-gradient-to-b from-white/[0.07] to-white/[0.01] p-6 shadow-[0_14px_50px_-22px_rgba(255,255,255,0.28)]">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">No subscription</div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-purple/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-brand-purple-soft">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-brand-purple-soft" />Limited time
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-white">30-Day Pass</h3>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="mb-1.5 font-display text-xl font-bold text-red-400 line-through">$24.99</span>
                    <span className="font-display text-4xl font-black text-white">$9.99</span>
                    <span className="mb-1.5 text-xs font-bold text-white/50">once</span>
                  </div>
                </div>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>10% off all our services</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>Priority booking</li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span><span className="text-brand-yellow">Entry to every draw</span></li>
                  <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>Valid 30 days, no renewal</li>
                </ul>
                <a href="https://buy.stripe.com/5kQaEX6w0bY19iM9u36kg0A" className="mt-6 flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 font-display text-sm font-black text-brand-ink transition hover:brightness-95 active:scale-95">
                  Get the pass · $9.99 →
                </a>
                <p className="mt-2.5 flex min-h-[2.5rem] items-start justify-center text-center text-xs text-white/40">One-off. Nothing renews.</p>
              </div>
            </Reveal>
          </div>
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

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths Detailing" className="mx-auto h-12 w-auto" />
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/50">{BUSINESS.address}</p>
          <p className="mt-3 text-sm">
            <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-white transition hover:text-brand-purple-soft">
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
