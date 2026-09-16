import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import OfferForm from "@/components/OfferForm";

/* Shared layout for the two personalised giveaway proposal pages for Ultimate
   Party Cairns (mini + major). Pure landing page, no nav, structured as a
   100M offer: dream outcome, value stack, what they put up, guarantee,
   process, scarcity, then an accept form. */

export interface PartyBusOfferProps {
  badge: string; // "Mini giveaway" / "Major giveaway"
  headline: ReactNode;
  sub: string;
  give: { t: string; d: string }[];
  putUp: string; // the prize they provide
  memberOffer: string;
  bonus?: string; // major only
  valueLine: ReactNode; // the value anchor
  note?: string; // flexibility line (major)
  source: string;
  offerLabel: string;
  ctaLabel: string;
}

const STEPS: { n: string; t: string; d: string }[] = [
  { n: "1", t: "You accept", d: "Give us the go-ahead and we are off." },
  { n: "2", t: "We plan it with you", d: "Map the giveaway, lock the prize and the dates." },
  { n: "3", t: "We research", d: "Your business, your competitors and your ideal customer." },
  { n: "4", t: "We script it", d: "Every piece planned and organised before we shoot." },
  { n: "5", t: "We film", d: "We come to you and shoot it all, a day, maybe a few." },
  { n: "6", t: "We schedule", d: "The whole run queued to roll out across every platform." },
  { n: "7", t: "We track", d: "Reach, followers, enquiries and bookings, all measured." },
  { n: "8", t: "We report", d: "Regular updates and tweaks as the giveaway runs." },
];

export default function PartyBusOffer({
  badge,
  headline,
  sub,
  give,
  putUp,
  memberOffer,
  bonus,
  valueLine,
  note,
  source,
  offerLabel,
  ctaLabel,
}: PartyBusOfferProps) {
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
              {badge} · Ultimate Party Cairns
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl">
              {headline}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65">{sub}</p>
          </Reveal>
        </div>
      </section>

      {/* ── WHAT WE DO + WHAT YOU PUT UP ── */}
      <section className="px-4 pb-4">
        <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-2">
          {/* what we do */}
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">What we do</div>
              <ul className="mt-4 flex flex-col gap-3">
                {give.map((g) => (
                  <li key={g.t} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>
                    <span>
                      <span className="font-display text-base font-black text-white">{g.t}</span>
                      <span className="ml-2 text-sm text-white/55">{g.d}</span>
                    </span>
                  </li>
                ))}
                {bonus && (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span>
                    <span>
                      <span className="font-display text-base font-black text-brand-yellow">Raw content for you</span>
                      <span className="ml-2 text-sm text-white/55">{bonus}</span>
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </Reveal>

          {/* what you put up */}
          <Reveal delay={100}>
            <div className="rounded-2xl border border-brand-yellow/40 bg-brand-yellow/[0.06] p-6 shadow-glowY">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-yellow">What you put up</div>
              <div className="mt-4 flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-lg">🎟️</span>
                <div>
                  <div className="font-display text-base font-black text-white">The prize</div>
                  <div className="mt-1 text-sm text-white/70">{putUp}</div>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-lg">🏷️</span>
                <div>
                  <div className="font-display text-base font-black text-white">A member discount</div>
                  <div className="mt-1 text-sm text-white/70">{memberOffer}</div>
                </div>
              </div>
              <p className="mt-5 border-t border-white/10 pt-4 text-sm font-semibold text-white/60">
                That is it. No cash, no fees. You put up the prize, we do the rest.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VALUE ANCHOR ── */}
      <section className="px-4 py-10">
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-2xl border border-brand-purple/40 bg-brand-purple/[0.08] px-6 py-6 text-center">
            <p className="text-base leading-relaxed text-white/80 sm:text-lg">{valueLine}</p>
          </div>
        </Reveal>
        {note && (
          <Reveal delay={80}>
            <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-white/50">{note}</p>
          </Reveal>
        )}
      </section>

      {/* ── GUARANTEE ── */}
      <section className="px-4 pb-6">
        <Reveal>
          <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-brand-green/30 bg-brand-green/[0.06] px-5 py-4">
            <span className="mt-0.5 shrink-0 text-brand-green">🛡️</span>
            <span className="text-sm leading-relaxed text-white/75">
              <span className="font-black text-white">You genuinely cannot lose.</span> If you do not feel you got enough
              value from the giveaway, we will refund the cost of your prize.
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
            <OfferForm source={source} offerLabel={offerLabel} ctaLabel={ctaLabel} />
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
