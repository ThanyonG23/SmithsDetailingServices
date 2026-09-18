import type { Metadata } from "next";
import CairnsEventsForm from "@/components/CairnsEventsForm";

/* Cairns Ultimate Party exclusive-events funnel, built as a full $100M-offer
   landing page: dream-outcome hero, VSL, the enquiry form as the star, then a
   value stack, real-fact proof, risk reversal, how-it-works, scarcity and FAQ,
   all driving back to the form. No nav. Branding taken from ultimatepartycairns.com
   (fire-engine red #FF0000 on black). Leads land in /ops tagged "partybus-events".
   Built inside the Smiths app for now so Thanyon can present the concept to Pete.
   NOTE: all proof points are real facts from Pete's business (24 years, only
   double-decker in Australia). No testimonials or results are fabricated. */

export const metadata: Metadata = {
  title: "Cairns Ultimate Party | Exclusive Events",
  description:
    "The whole Cairns trip, planned and run for you. Reef, helicopter, golf, dining and nightlife, tied together by the only double-decker party bus in Australia. One call, one package.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cairns-events" },
};

const RED = "#ff0000";
const RED_DEEP = "#c20000";
const RED_SOFT = "#ff5a5a";

/* Value stack. Prices are real "from" market rates for the region (research
   Sept 2026), used honestly to anchor the value of a done-for-you package. */
const STACK: { icon: string; label: string; note: string }[] = [
  { icon: "🐠", label: "Great Barrier Reef days", note: "Outer reef pontoons & private charters" },
  { icon: "🚁", label: "Helicopter & scenic flights", note: "Reef and rainforest from the air" },
  { icon: "🛥️", label: "Private yacht & island charters", note: "Whole-boat, crewed, catered" },
  { icon: "⛳", label: "Championship golf", note: "Coral Sea courses, corporate days" },
  { icon: "🥩", label: "The best food in town", note: "Fine dining & private chef nights" },
  { icon: "🍹", label: "Bars, clubs & nightlife", note: "VIP entry, no cover charges" },
  { icon: "🚌", label: "The double-decker party bus", note: "The only one in Australia" },
  { icon: "🏝️", label: "Stays & transfers", note: "Accommodation and airport pickups" },
  { icon: "🗺️", label: "Your full itinerary, designed", note: "Every day mapped to your group" },
  { icon: "📞", label: "A dedicated planner", note: "One point of contact, start to finish" },
];

const PROOF: { big: string; small: string }[] = [
  { big: "24 years", small: "running Cairns' best nights out" },
  { big: "The only one", small: "double-decker party bus in Australia" },
  { big: "Every operator", small: "reef, heli, golf and dining, we know them all" },
  { big: "One call", small: "the whole trip planned, booked and run" },
];

const STEPS: { n: string; t: string; d: string }[] = [
  { n: "1", t: "Tell us the vibe", d: "Answer a few quick questions above. Takes two minutes." },
  { n: "2", t: "We call and plan", d: "One on one, we get your group, your dates and your dream trip." },
  { n: "3", t: "We present your package", d: "A full custom Cairns experience, one plan, one price." },
  { n: "4", t: "You approve, we run it", d: "Only then do we lock it in. You just show up and enjoy." },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How much does it cost?",
    a: "Every trip is built to your group size, your days and what you want to do. You set the budget in the form and we design the best possible experience to it. Tell us what you're working with and we'll make it work.",
  },
  {
    q: "How big can the group be?",
    a: "From small VIP groups to large corporate teams and wedding parties. The double-decker bus alone carries up to 100. Tell us your numbers and we build the experience around them.",
  },
  {
    q: "What if it rains?",
    a: "Cairns is a year-round destination and we build weather into every plan, with covered and indoor options ready. Your trip is a great one, rain or shine.",
  },
  {
    q: "How far ahead should we book?",
    a: "Peak season, June to October, books out weeks ahead across the region. The earlier you enquire, the more we can secure for you.",
  },
  {
    q: "Who runs it on the day?",
    a: "Cairns Ultimate Party. 24 years of running the best nights in Cairns, with the only double-decker party bus in Australia, handling everything on the ground.",
  },
];

function CTA({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#plan"
      className="inline-flex items-center justify-center rounded-full px-8 py-4 font-display text-base font-black uppercase tracking-wide text-white transition hover:brightness-110 active:scale-95"
      style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})`, boxShadow: `0 14px 40px -14px ${RED}` }}
    >
      {children}
    </a>
  );
}

export default function CairnsEventsPage() {
  return (
    <main className="min-h-screen bg-[#08080a] text-white">
      {/* ── brand bar (no menu) ── */}
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-4 sm:flex-row sm:justify-between">
          {/* Swap this wordmark for Pete's actual logo file when we have it. */}
          <div className="text-center sm:text-left">
            <div className="font-display text-lg font-black uppercase leading-none tracking-[0.08em]">
              <span className="text-white">Cairns</span> <span style={{ color: RED }}>Ultimate Party</span>
            </div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-white/45">Exclusive Events</div>
          </div>
          <a href="tel:0740410332" className="mt-2 text-sm font-bold text-white/70 transition hover:text-white sm:mt-0">
            07 4041 0332
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 pt-12 pb-8 sm:pt-16">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[560px] -translate-x-1/2 rounded-full opacity-30 blur-[130px]"
          style={{ background: `radial-gradient(closest-side, ${RED}, transparent 70%)` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em]"
            style={{ borderColor: `${RED}66`, color: RED_SOFT, background: `${RED}14` }}
          >
            🌴 The whole trip, planned for you
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[1.02] tracking-tight sm:text-6xl">
            The ultimate
            <br />
            <span style={{ color: RED }}>Cairns experience</span>,
            <br className="sm:hidden" /> built around you
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Great Barrier Reef days, helicopter flights, golf, the best food in town and world-class nightlife, tied
            together by the only double-decker party bus in Australia. You tell us the vibe. We plan and run the entire
            thing. One call, one package, zero stress.
          </p>
          <div className="mt-7">
            <CTA>Get my custom plan →</CTA>
          </div>
        </div>
      </section>

      {/* ── VSL ── */}
      <section className="px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <div
            className="relative aspect-video w-full overflow-hidden rounded-3xl border"
            style={{ borderColor: `${RED}66`, boxShadow: `0 24px 90px -30px ${RED}` }}
          >
            {/*
              VSL GOES HERE.
              Once the video is cut and compressed, drop the file in /public
              (e.g. /public/cairns-events-vsl.mp4 + a poster frame) and replace
              this placeholder block with:

              <video controls playsInline poster="/cairns-events-poster.jpg"
                     className="h-full w-full object-cover">
                <source src="/cairns-events-vsl.mp4" type="video/mp4" />
              </video>
            */}
            <div
              className="flex h-full w-full flex-col items-center justify-center text-center"
              style={{ background: "linear-gradient(135deg, #1a1010, #0b0808)" }}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: `linear-gradient(135deg, ${RED}, ${RED_DEEP})` }}
              >
                <span className="ml-1 text-2xl">▶</span>
              </div>
              <div className="mt-4 font-display text-sm font-black uppercase tracking-[0.2em] text-white/70">
                Your VSL goes here
              </div>
              <div className="mt-1 max-w-xs text-xs text-white/35">
                Reef, helicopter, go-karting, the best steak in town, all of Cairns
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM (the star) ── */}
      <section id="plan" className="scroll-mt-4 px-4 pt-6 pb-8">
        <div className="mx-auto max-w-lg">
          <div className="mb-5 text-center">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
              Get your custom plan
            </h2>
            <p className="mt-2 text-sm text-white/55">
              Answer a few quick questions and we&apos;ll call you to build it around exactly what you want.
            </p>
          </div>
          <CairnsEventsForm />
        </div>
      </section>

      {/* ── VALUE STACK ── */}
      <section className="border-t border-white/10 px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: RED_SOFT }}>
              Everything, handled
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              One package. One price. All of Cairns.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
              You could spend weeks chasing a dozen operators and still miss the best of Cairns. Or make one call and
              have every bit of it planned, booked and run for you.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {STACK.map((s) => (
              <div key={s.label} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="font-display text-sm font-black text-white">{s.label}</div>
                  <div className="mt-0.5 text-xs text-white/50">{s.note}</div>
                </div>
                <span className="ml-auto mt-1 shrink-0 text-sm font-black" style={{ color: RED_SOFT }} aria-hidden>
                  ✓
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-white/35">
            Real Cairns experiences. We line up the lot, so it all comes to you as one plan and one price.
          </p>
        </div>
      </section>

      {/* ── PROOF (real facts only) ── */}
      <section className="border-t border-white/10 bg-black px-4 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
          {PROOF.map((p) => (
            <div key={p.big} className="text-center">
              <div className="font-display text-2xl font-black" style={{ color: RED }}>
                {p.big}
              </div>
              <div className="mt-1 text-xs leading-snug text-white/55">{p.small}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GUARANTEE (risk reversal) ── */}
      <section className="px-4 py-12">
        <div
          className="mx-auto flex max-w-2xl items-start gap-4 rounded-3xl border px-6 py-6"
          style={{ borderColor: `${RED}44`, background: `${RED}0d` }}
        >
          <span className="mt-0.5 shrink-0 text-3xl">🛡️</span>
          <div>
            <div className="font-display text-lg font-black text-white">No pressure, no lock-in</div>
            <p className="mt-1.5 text-sm leading-relaxed text-white/70">
              Tell us what you want and we design it around you. We plan and re-plan until it&apos;s the trip you
              actually want, and you decide if you go ahead once you&apos;ve seen it. Enquiring costs you nothing.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-white/10 px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: RED_SOFT }}>
              How it works
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              From two minutes to the trip of a lifetime
            </h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-black text-white"
                  style={{ background: RED }}
                >
                  {s.n}
                </div>
                <div className="mt-3 font-display text-sm font-black text-white">{s.t}</div>
                <div className="mt-1 text-xs leading-relaxed text-white/55">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCARCITY + CTA ── */}
      <section className="px-4 py-12 text-center">
        <div className="mx-auto max-w-xl">
          <p className="text-sm font-semibold leading-relaxed text-white/65">
            We only take a handful of group builds each month, and peak season, June to October, fills fast. If your
            dates are close, get your enquiry in now so we can secure the best of Cairns for you.
          </p>
          <div className="mt-6">
            <CTA>Start my custom plan →</CTA>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-white/10 px-4 py-14">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: RED_SOFT }}>
              Questions
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              Good to know
            </h2>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-sm font-black text-white">
                  {f.q}
                  <span className="shrink-0 text-lg transition group-open:rotate-45" style={{ color: RED_SOFT }} aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <div className="font-display text-sm font-black uppercase tracking-[0.1em]">
            <span className="text-white">Cairns</span> <span style={{ color: RED }}>Ultimate Party</span>
          </div>
          <p className="mt-2 text-xs text-white/40">
            10A Shields Street, Cairns QLD 4870 · 07 4041 0332 · sales@ultimatepartycairns.com
          </p>
          <p className="mt-2 text-xs text-white/25">© {new Date().getFullYear()} Cairns Ultimate Party · Exclusive Events</p>
        </div>
      </footer>
    </main>
  );
}
