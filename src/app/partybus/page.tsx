import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import OfferForm from "@/components/OfferForm";

/* Personalised giveaway proposal for Ultimate Party Cairns. ONE continuous
   6-week campaign: a mini giveaway to build the crowd, then the major giveaway
   revealed once the mini draw finishes, with paid Meta ads behind all of it.
   Pure landing page, 100M-offer structure. */

export const metadata: Metadata = {
  title: "Giveaway Campaign for Ultimate Party Cairns | Smiths",
  description:
    "A continuous 6-week giveaway campaign for Ultimate Party Cairns. A mini giveaway to build the crowd, then a major month-long giveaway, with paid Meta ads behind all of it. You put up the prizes, we do the rest.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/partybus" },
};

const PHASES: {
  tag: string;
  weeks: string;
  title: string;
  blurb: string;
  give: string[];
  prize: string;
  featured?: boolean;
  bonus?: string;
}[] = [
  {
    tag: "Phase 1",
    weeks: "Weeks 1 to 2",
    title: "The mini giveaway",
    blurb: "The warm-up. We build the crowd and the hype before the big one.",
    give: [
      "A week of content, filmed with you, across TikTok, Instagram, Facebook and YouTube",
      "Your business tagged in every post",
      "Featured on our website with a link to your bookings",
    ],
    prize: "2 free tickets on your party bus",
  },
  {
    tag: "Phase 2",
    weeks: "Weeks 3 to 6",
    title: "The major giveaway",
    blurb: "The main event, revealed to a crowd that's already warmed up. We don't announce it until the mini draw is done, so the hype rolls straight in.",
    featured: true,
    give: [
      "1 reel and 2 stories every day, for a month straight, across every platform",
      "Your business tagged and linked in every piece",
      "Featured on our website for the full month",
    ],
    prize: "A $500 party bus hire, bring 10 mates, run as a Christmas Lights Tour",
    bonus: "A batch of the raw footage, handed over for your own socials",
  },
];

const STEPS: { n: string; t: string; d: string }[] = [
  { n: "1", t: "You accept", d: "Give us the go-ahead and we are off." },
  { n: "2", t: "We plan it with you", d: "Map both giveaways, lock the prizes and the dates." },
  { n: "3", t: "We research", d: "Your business, your competitors and your ideal customer." },
  { n: "4", t: "We script it", d: "Every piece planned and organised before we shoot." },
  { n: "5", t: "We film", d: "We come to you and shoot it all, a day, maybe a few." },
  { n: "6", t: "We schedule", d: "The whole 6 weeks queued to roll out across every platform." },
  { n: "7", t: "We track", d: "Reach, followers, enquiries and bookings, all measured." },
  { n: "8", t: "We report", d: "Regular updates and tweaks as the campaign runs." },
];

export default function PartyBusPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-purple/40 bg-brand-purple/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-brand-purple-soft">
              A 6-week campaign · Ultimate Party Cairns
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl">
              Six weeks. Two giveaways.
              <br />
              <span className="text-brand-purple-soft">All of Cairns.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65">
              We run it as one continuous campaign. A mini giveaway to build the crowd, then the major giveaway to that
              warmed-up audience, with paid Meta ads behind all of it. You don&apos;t pay a cent, you just put up the
              prizes.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── THE CAMPAIGN (two phases) ── */}
      <section className="px-4 pb-4">
        <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-2">
          {PHASES.map((p, i) => (
            <Reveal key={p.tag} delay={i * 100}>
              <div
                className={`flex h-full flex-col rounded-3xl border p-6 sm:p-7 ${
                  p.featured
                    ? "border-brand-purple/50 bg-gradient-to-b from-brand-purple/[0.12] to-white/[0.02] shadow-[0_0_60px_-24px_rgba(124,47,245,0.6)]"
                    : "border-white/12 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-purple/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-brand-purple-soft">
                    {p.tag}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">{p.weeks}</span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{p.blurb}</p>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <ul className="flex flex-col gap-2">
                    {p.give.map((g) => (
                      <li key={g} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/85">
                        <span className="mt-0.5 shrink-0 text-brand-green">✓</span>
                        <span>{g}</span>
                      </li>
                    ))}
                    {p.bonus && (
                      <li className="flex items-start gap-2.5 text-sm leading-relaxed text-brand-yellow">
                        <span className="mt-0.5 shrink-0">🎁</span>
                        <span>{p.bonus}</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.07] px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-yellow">You put up</div>
                  <div className="mt-1 text-sm font-semibold text-white">🎟️ {p.prize}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PAID ADS + MEMBER DISCOUNT ── */}
      <section className="px-4 py-8">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
          <Reveal>
            <div className="flex h-full items-start gap-3 rounded-2xl border border-brand-purple/40 bg-brand-purple/[0.08] px-5 py-4">
              <span className="mt-0.5 shrink-0 text-lg">🚀</span>
              <span className="text-sm leading-relaxed text-white/80">
                <span className="font-black text-white">Paid Meta ads behind the whole thing.</span> It&apos;s not just
                our audience, we put ad spend across Facebook and Instagram so the campaign reaches the whole of Cairns.
              </span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex h-full items-start gap-3 rounded-2xl border border-brand-yellow/40 bg-brand-yellow/[0.07] px-5 py-4">
              <span className="mt-0.5 shrink-0 text-lg">🏷️</span>
              <span className="text-sm leading-relaxed text-white/80">
                <span className="font-black text-white">A member discount.</span> Our members get 10% off your services,
                so the exposure turns into actual bookings, not just eyeballs.
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VALUE ANCHOR ── */}
      <section className="px-4 py-6">
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-2xl border border-brand-purple/40 bg-brand-purple/[0.08] px-6 py-6 text-center">
            <p className="text-base leading-relaxed text-white/80 sm:text-lg">
              Six weeks of daily content across four platforms, plus the paid ad spend behind it, would run you{" "}
              <span className="font-black text-white">$3,000 to $6,000+</span> from an agency. Here it costs you nothing
              but the two prizes.
            </p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-white/50">
            We&apos;ve anchored the major to your Christmas Lights Tour for the season, but the theme and the prizes are
            yours to shape. We&apos;ll run whatever you&apos;d most like to give away.
          </p>
        </Reveal>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="px-4 pb-6">
        <Reveal>
          <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-brand-green/30 bg-brand-green/[0.06] px-5 py-4">
            <span className="mt-0.5 shrink-0 text-brand-green">🛡️</span>
            <span className="text-sm leading-relaxed text-white/75">
              <span className="font-black text-white">You genuinely cannot lose.</span> If you don&apos;t feel you got
              enough value from the campaign, we&apos;ll refund the cost of your prizes.
            </span>
          </div>
        </Reveal>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-y border-white/10 bg-white/[0.02] px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">How it works</div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                From yes to a packed bus
              </h2>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 50}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple font-display text-sm font-black text-white">
                    {s.n}
                  </div>
                  <div className="mt-3 font-display text-sm font-black text-white">{s.t}</div>
                  <div className="mt-1 text-xs leading-relaxed text-white/55">{s.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCARCITY ── */}
      <section className="px-4 pt-12 text-center">
        <Reveal>
          <p className="mx-auto max-w-xl text-sm font-semibold text-white/55">
            We only feature one party bus business in Cairns. This slot is yours if you want it.
          </p>
        </Reveal>
      </section>

      {/* ── ACCEPT FORM ── */}
      <section id="accept" className="scroll-mt-6 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <OfferForm
              source="partybus"
              offerLabel="Ultimate Party Cairns, 6-week giveaway campaign (mini + major + Meta ads)"
              ctaLabel="Lock in the campaign →"
            />
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Smiths Detailing Services · Cairns</p>
        </div>
      </footer>
    </main>
  );
}
