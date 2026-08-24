import Link from "next/link";
import Reveal from "@/components/Reveal";
import MembershipSignup from "@/components/MembershipSignup";
import ReviewsSection from "@/components/ReviewsSection";
import SiteNav from "@/components/SiteNav";
import { BUSINESS } from "@/lib/config";

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

const STEPS: { n: string; title: string; body: string; image?: string }[] = [
  { n: "1", title: "Reserve your spot", body: "Takes 30 seconds. No payment and nothing locked in yet, you're just claiming a founding spot.", image: "/media/photos/step-reserve.png" },
  { n: "2", title: "We call you", body: "We confirm your car, your exact weekly price, and book in your first detail." },
  { n: "3", title: "Hand us the keys", body: "We keep it detailed and serviced on a schedule. You never think about car admin again." },
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
      <SiteNav cta={{ label: "Reserve Spot", href: "#reserve" }} />

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
              Founding members · Cairns · 15 spots left
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
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-white/65">
              For the people who keep meaning to get their car detailed and serviced but never find the
              time. Drop it off and we handle both, on a schedule, so it&apos;s always clean, always
              sorted, and you never think about it again.
            </p>
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
                href="#reserve"
                className="inline-flex rounded-full bg-brand-green px-8 py-4 font-display text-base font-extrabold text-brand-ink shadow-[0_10px_40px_rgba(43,255,122,0.25)] transition hover:brightness-110 active:scale-95"
              >
                Reserve my spot →
              </a>
              <p className="mt-3 text-xs text-white/40">No payment now · Next 15 members get a free Cut &amp; Polish</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ GIVEAWAY PROMO ═══ */}
      <section className="py-10">
        <div className="mx-auto max-w-2xl px-4">
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
                  Members&apos; draw · drawn 30 Sept
                </div>
                <h3 className="mt-1.5 font-display text-xl font-extrabold leading-tight text-white sm:text-2xl">
                  Win <span className="text-brand-yellow">$1,000 cash</span> or a{" "}
                  <span className="text-brand-yellow">$2,200</span> paint correction &amp; coating
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Every active member is automatically entered. Join now and you&apos;re in.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-yellow group-hover:text-white">
                  See draw terms
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="border-y border-white/5 bg-white/[0.015] py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Reveal>
            <div className="text-center">
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Three steps and you&apos;re done thinking about it
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                  {s.image ? (
                    <div className="relative aspect-[3/2] w-full overflow-hidden bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-green/[0.07] to-white/[0.02]">
                      <span className="font-display text-6xl font-black text-white/10">{s.n}</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/15 font-display text-base font-black text-brand-green">
                      {s.n}
                    </span>
                    <h3 className="mt-4 font-display text-lg font-extrabold tracking-tight text-white">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* explainer video, same section */}
          <Reveal delay={120}>
            <div className="relative mx-auto mt-14 w-full max-w-[300px]">
              <div
                className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-40 blur-2xl"
                style={{ background: GREEN_GLOW }}
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-black shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)]">
                <video
                  src={EXPLAINER_VIDEO}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] w-full bg-black object-cover"
                />
              </div>
            </div>
          </Reveal>
          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-white/55">
            A quick look at how it works, straight from us.
          </p>
        </div>
      </section>

      {/* ═══ THE PLAN ═══ */}
      <section className="py-20 sm:py-24">
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
                    Next 15 members only
                  </div>
                </div>
              </div>
            </Reveal>
          )}
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-brand-green/30 bg-gradient-to-b from-brand-green/[0.08] to-transparent p-7 sm:p-10">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full opacity-20 blur-[80px]"
                style={{ background: YELLOW_GLOW }}
                aria-hidden
              />
              <div className="relative text-center">
                <Eyebrow>The membership</Eyebrow>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  The Smiths Detailing Membership
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/55">
                  Everything your car needs, handled on a schedule. You just drop it off.
                </p>
                <div className="mt-6 flex items-end justify-center gap-1.5">
                  <span className="mb-2 text-lg font-bold text-white/50">From</span>
                  <span className="font-display text-5xl font-black text-white sm:text-6xl">{PRICE}</span>
                  <span className="mb-2 text-lg font-bold text-white/50">/week</span>
                </div>
                <p className="mt-1 text-xs text-white/40">Billed weekly · cancel anytime · larger vehicles slightly more</p>

                <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-brand-yellow/45 bg-brand-yellow/[0.10] px-4 py-2 text-[13px] font-bold text-brand-yellow">
                  🎁 Next 15 members get a FREE Cut &amp; Polish valued at $750+
                </div>
              </div>

              <div className="mt-8">
                <div className="rounded-2xl border border-brand-green/20 bg-brand-green/[0.05] px-4 py-3 text-center text-sm text-white/75">
                  <b className="text-white">Every 3 months:</b> detail + top-up.{" "}
                  <b className="text-white">Every 6 months:</b> detail + full service.
                </div>

                <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-green">
                  Every visit (every 3 months)
                </p>
                <div className="flex flex-col gap-3">
                  {EVERY_VISIT.map((g) => (
                    <GroupCard key={g.title} g={g} />
                  ))}
                </div>

                <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-yellow">
                  Every 6 months, we also add
                </p>
                <div className="flex flex-col gap-3">
                  {EVERY_6_MONTHS.map((g) => (
                    <GroupCard key={g.title} g={g} />
                  ))}
                </div>

                <p className="mt-5 text-center text-sm text-white/55">
                  Plus <b className="text-white/75">10% off add-ons and vehicle hire</b>, and priority booking, members always come first.
                </p>
              </div>

              <a
                href="#reserve"
                className="mt-8 flex w-full items-center justify-center rounded-full bg-brand-yellow px-7 py-4 font-display text-base font-black text-brand-ink transition hover:brightness-110 active:scale-95"
              >
                Reserve my spot →
              </a>
              <p className="mt-3 text-center text-[13px] text-white/45">
                💯 Backed by the Smiths promise: if you&apos;re not happy, you don&apos;t pay.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <ReviewsSection />

      {/* ═══ RESERVE ═══ */}
      <section id="reserve" className="scroll-mt-8 py-16">
        <div className="mx-auto max-w-xl px-4">
          <Reveal>
            <MembershipSignup />
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
