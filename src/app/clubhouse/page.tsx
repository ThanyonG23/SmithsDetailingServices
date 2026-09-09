import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SiteNav from "@/components/SiteNav";
import ReviewsSection from "@/components/ReviewsSection";
import DrawCard from "@/components/DrawCard";
import { BUSINESS } from "@/lib/config";

// Draw times (kept in sync with the membership page).
const DRAW_TIME = "2026-09-14T12:00:00+10:00";
const DRAW_MINI_TIME = "2026-09-21T12:00:00+10:00";

/* Smiths Garage clubhouse / Garage Club early-access membership page. */

export const metadata: Metadata = {
  title: "Smiths Garage · The Garage Club",
  description: "Early access to the Smiths Garage members' club. Detail your own car in our bays, hang out, and go in every draw.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clubhouse" },
};

const LOGO = "/media/photos/smiths-garage-logo.png";
const HERO = "/media/photos/clubhouse.jpg";
const PRICE = "$34.99"; // early-access monthly price
const JOIN_URL = "https://buy.stripe.com/00wbJ13jOaTXdz2bCb6kg0C";

const STACK: { icon: string; title: string; desc: string; value: string; hero?: boolean }[] = [
  { icon: "🔧", title: "Unlimited DIY Detailing Bay", desc: "Bring your car in as often as you like and detail it yourself with our pro equipment and products. No booking fees, no per-session cost, ever.", value: "Unlimited", hero: true },
  { icon: "🥃", title: "The Clubhouse", desc: "The members' lounge, TVs, pool, cars and community. A place to actually hang out.", value: "Coming soon", hero: true },
  { icon: "🎁", title: "Every members' draw", desc: "Automatically entered to win cash, details and prizes, every draw we run.", value: "$1,000s in prizes" },
  { icon: "✨", title: "10% off all detailing", desc: "Member rate on every service, every time.", value: "Save $100s" },
  { icon: "🎓", title: "Detailing induction & masterclass", desc: "Learn to detail properly, so you get the most out of the bay.", value: "$99 value" },
  { icon: "⚡", title: "Priority booking", desc: "Members get seen first when we're busy.", value: "Included" },
  { icon: "🎉", title: "Member events & nights", desc: "Meet-ups, live nights and members-only events at the clubhouse.", value: "Coming soon" },
];

const GLOW = "radial-gradient(closest-side, #7c2ff5, transparent 70%)";

export default function ClubhousePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <SiteNav cta={{ label: "Join the club", href: "#join" }} accent="purple" />

      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[86vh] items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO})` }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/60 to-black/40" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050506] to-transparent" aria-hidden />

        <div className="relative mx-auto w-full max-w-4xl px-5 pb-16 pt-32 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/40 bg-brand-purple/[0.12] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-purple-soft" />
              Now building · early access
            </span>
          </Reveal>
          <Reveal delay={100}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Garage" className="mx-auto mt-7 w-full max-w-xs sm:max-w-sm" />
          </Reveal>
          <Reveal delay={200}>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1] tracking-tight text-white sm:text-6xl">
              The members&apos; <span className="text-brand-purple-soft">garage club</span>
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Not a detailer. A club. Detail your own car with our gear, hang out in the lounge, and go in every members&apos; draw. We&apos;re building it now, get in early.
            </p>
          </Reveal>
          <Reveal delay={400}>
            <a href={JOIN_URL} className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-brand-purple px-8 py-4 font-display text-base font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110 active:scale-95">
              Get early access, {PRICE}/mo
            </a>
            <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">{PRICE}/month · cancel anytime</div>
          </Reveal>
        </div>
      </section>

      {/* ═══ EARLY ACCESS ═══ */}
      <section className="border-b border-white/5 px-4 py-12 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Get in early</div>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              We&apos;re building it. Join now and grow with it.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65">
              The Garage Club is being built right now. Get in early for{" "}
              <b className="text-white">{PRICE}/month</b> and unlock everything, the bays, the lounge, the draws, as each
              piece opens. Cancel anytime.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ VALUE STACK ═══ */}
      <section id="join" className="scroll-mt-16 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">30 Seconds</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                The Idea
              </h2>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="relative mx-auto mt-8 max-w-[300px]">
              <div className="pointer-events-none absolute -inset-4 rounded-[2rem] opacity-40 blur-2xl" style={{ background: GLOW }} aria-hidden />
              <div className="relative overflow-hidden rounded-2xl border border-brand-purple/40 bg-black shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)]">
                <video
                  src="/media/videos/clubhouse-intro.mp4"
                  poster="/media/photos/clubhouse-intro-poster.jpg"
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] w-full bg-black"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Everything you get</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                One membership. The whole garage.
              </h2>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-8 overflow-hidden rounded-3xl border border-brand-purple/40 bg-gradient-to-b from-brand-purple/[0.10] to-white/[0.02] shadow-[0_0_70px_-20px_rgba(124,47,245,0.6)]">
              <ul className="flex flex-col divide-y divide-white/8">
                {STACK.map((s) => (
                  <li key={s.title} className={`flex items-start gap-4 px-5 py-4 sm:px-7 ${s.hero ? "bg-brand-purple/[0.06]" : ""}`}>
                    <span className="mt-0.5 text-2xl leading-none">{s.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-base font-extrabold tracking-tight text-white">{s.title}</div>
                      <div className="mt-0.5 text-sm leading-relaxed text-white/60">{s.desc}</div>
                    </div>
                    <span className="shrink-0 whitespace-nowrap pt-0.5 text-sm font-black tabular-nums text-brand-yellow">{s.value}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-brand-purple/30 bg-brand-purple/[0.10] px-5 py-6 text-center sm:px-7">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-yellow/40 bg-brand-yellow/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-brand-yellow">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-yellow" />Only 10 spots left
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Over $2,000 of value a year</div>
                <div className="mt-2 flex items-end justify-center gap-1.5">
                  <span className="font-display text-5xl font-black text-white sm:text-6xl">{PRICE}</span>
                  <span className="mb-2 text-sm font-bold text-white/50">/month</span>
                </div>
                <div className="mt-1.5 inline-flex items-center rounded-full bg-brand-purple/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-purple-soft">
                  Early access · cancel anytime
                </div>
                <div className="mt-2 text-xs text-white/45">Everything unlocks as we build it out.</div>
                <a href={JOIN_URL} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-purple px-8 py-3.5 font-display text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110 active:scale-95">
                  Get early access →
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ RECENT WINNERS ═══ */}
      <section className="border-t border-white/5 px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Real winners</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Recent winners from member draws
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {[
                { src: "/media/videos/winner-mini-draw.mp4", poster: "/media/photos/winner-poster.jpg" },
                { src: "/media/videos/winner-2.mp4", poster: "/media/photos/winner-2-poster.jpg" },
              ].map((v) => (
                <div key={v.src} className="relative mx-auto w-full max-w-[300px]">
                  <div className="pointer-events-none absolute -inset-4 rounded-[2rem] opacity-40 blur-2xl" style={{ background: GLOW }} aria-hidden />
                  <div className="relative overflow-hidden rounded-2xl border border-brand-purple/40 bg-black shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)]">
                    <video src={v.src} poster={v.poster} controls playsInline preload="metadata" className="aspect-[9/16] w-full bg-black" />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ UPCOMING DRAWS ═══ */}
      <section className="border-t border-white/5 px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">You&apos;re in every one</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Upcoming draws
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <DrawCard
                poster="/media/photos/giveaway.jpg"
                alt="Smiths members' giveaway, win $1,000 cash or a $2,200 paint correction and ceramic coating"
                label="Big draw · drawn 14 Sept"
                title={<>Win <span className="text-brand-purple-soft">$1,000 cash</span> or a <span className="text-brand-purple-soft">$2,200</span> paint correction &amp; coating</>}
                blurb="Every active member is automatically entered. Join now and you are in."
                target={DRAW_TIME}
                termsHref="/draw-terms"
              />
              <DrawCard
                poster="/media/photos/mini-giveaway.jpg"
                alt="Smiths members' mini draw, win $300 cash or a $400+ detail"
                label="Mini draw · drawn 21 Sept"
                title={<>Win <span className="text-brand-purple-soft">$300 cash</span> or a <span className="text-brand-purple-soft">$400+</span> detail</>}
                blurb="A small member pool right now means the best odds you will ever get. Join and you're in."
                target={DRAW_MINI_TIME}
                termsHref="/mini-draw-terms"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ THE DIY BAY ═══ */}
      <section className="border-y border-white/5 bg-white/[0.015] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">The DIY bay</div>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Detail your own car, like a pro
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65">
              No driveway? No gear? No worries. As a member you can book a bay <b className="text-white">as often as you like, no extra cost</b>,
              and use our professional equipment and products on your own car, wash, interior, polish, the lot. Learn from us,
              do it yourself, and take pride in it.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { t: "Pro equipment", d: "Machines, tools, lighting and water, all set up and ready." },
                { t: "Our products", d: "Use the full Smiths Garage range while you're in the bay." },
                { t: "Learn as you go", d: "A member induction and masterclass so you get it right." },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
                  <div className="font-display text-base font-extrabold text-white">{c.t}</div>
                  <div className="mt-1.5 text-sm leading-relaxed text-white/55">{c.d}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ THE CLUBHOUSE ═══ */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <Reveal>
              <div className="relative">
                <div className="pointer-events-none absolute -inset-4 rounded-[2rem] opacity-40 blur-2xl" style={{ background: GLOW }} aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={HERO} alt="The Smiths Garage clubhouse" className="relative w-full rounded-2xl border border-brand-purple/40" />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">The clubhouse</div>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  A place people want to be
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/65">
                  Cars out back, mates out front. The lounge, the pool table, the screens, and the community, this is the
                  spot you come to hang out, watch the draws happen live, and be part of something.
                </p>
                <ul className="mt-6 flex flex-col gap-2.5 text-sm text-white/80">
                  {["Members' lounge & big screens", "Pool table & games", "Live members' draws", "Member events & nights"].map((x) => (
                    <li key={x} className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>{x}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <ReviewsSection accent="purple" />

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths Garage" className="mx-auto h-12 w-auto" />
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/50">{BUSINESS.address}</p>
          <Link href="/membership" className="mt-5 inline-block text-sm text-white/50 underline underline-offset-4 transition hover:text-white">
            ← Back to membership
          </Link>
        </div>
      </footer>
    </main>
  );
}
