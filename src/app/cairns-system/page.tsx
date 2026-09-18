import type { Metadata } from "next";

/* Partner explainer page for Pete (Cairns Ultimate Party), presented as Thanyon's
   growth-partner pitch. Walks Pete through the whole system: the attraction offer
   / ads, the landing page, the money model (planning fee + 20%), who does what,
   and the contract. Clean and skimmable, meant to be sent as a link. No nav,
   noindex. Branding: Thanyon (purple). Numbers are illustrative and labelled as
   such, nothing fabricated. */

export const metadata: Metadata = {
  title: "The Growth System | Thanyon x Cairns Ultimate Party",
  description:
    "The complete marketing and sales system built for Cairns Ultimate Party: how leads come in, how trips get sold, and how we both make money.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cairns-system" },
};

const PURPLE = "#7c2ff5";
const PURPLE_DEEP = "#5a1cc0";
const PURPLE_SOFT = "#a970ff";
const GREEN = "#2bff7a";

const FUNNEL: { n: string; t: string; d: string }[] = [
  { n: "1", t: "The ad (attraction offer)", d: "Paid ads run across Australia to teams, wedding parties and groups thinking about Cairns." },
  { n: "2", t: "The landing page", d: "They watch a short video and answer a few quick questions about the trip they want." },
  { n: "3", t: "I call them", d: "One on one, I find out exactly what they want, need and can spend." },
  { n: "4", t: "I build the plan", d: "A full custom Cairns itinerary, every piece tied together. They pay me to design it." },
  { n: "5", t: "I present the package", d: "One plan, one price, sold over the phone. Deposit taken to lock it in." },
  { n: "6", t: "You deliver it", d: "The bus, the day, the experience. You do what you do best and make the client's trip." },
];

const ROLES_ME = [
  "Build and pay for all the ads (national and local)",
  "Own the landing pages, funnels, socials and content",
  "Handle every lead, call and sale over the phone",
  "Negotiate every supplier, build the itinerary and set the price",
  "Track everything and report back to you",
];
const ROLES_PETE = [
  "Provide the double-decker bus and drivers",
  "Deliver and execute each trip to the plan",
  "Make sure every client has a great experience",
  "Keep your licences and insurances current",
  "Honour the bookings we bring you",
];

const TERMS = [
  { t: "12 month agreement", d: "A full year to build this properly, then we renew or renegotiate." },
  { t: "You pay nothing for marketing", d: "I fund all the advertising. It costs you nothing to have this running." },
  { t: "20% commission", d: "I take 20% of the revenue I generate. You keep the rest after your suppliers." },
  { t: "The planning fee is mine", d: "The planning fee I charge clients ($0 to $1,000) to build their plan is separate and stays with me." },
  { t: "Exclusive to me", d: "While we work together, you use me for marketing and sales, not anyone else. That covers local ad campaigns and offers too, not just the national trips." },
  { t: "I own what I build", d: "The ads, funnels, pages and systems stay mine. You get a licence to use them while we work together." },
];

export default function CairnsSystemPage() {
  return (
    <main className="min-h-screen bg-[#08080a] text-white">
      {/* ── brand bar ── */}
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <div className="font-display text-lg font-black uppercase leading-none tracking-[0.14em]" style={{ color: PURPLE_SOFT }}>
              THANYON
            </div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-white/45">Growth Partner</div>
          </div>
          <span className="text-xs font-bold text-white/40">Prepared for Cairns Ultimate Party</span>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 pt-14 pb-8 sm:pt-20">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[560px] -translate-x-1/2 rounded-full opacity-30 blur-[130px]"
          style={{ background: `radial-gradient(closest-side, ${PURPLE}, transparent 70%)` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[1.03] tracking-tight sm:text-6xl">
            A machine that
            <br />
            <span style={{ color: PURPLE_SOFT }}>books out your bus</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Here is exactly what I am building for Cairns Ultimate Party. A complete marketing and sales system that
            brings in high-value group trips, corporate teams, weddings, milestones and wealthy visitors, and turns them
            into bookings. I build it, I fund it, I sell it. You deliver the experience. We both win.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="/cairns-events"
              target="_blank"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 font-display text-sm font-black uppercase tracking-wide text-white transition hover:brightness-110 active:scale-95"
              style={{ background: `linear-gradient(90deg, ${PURPLE_DEEP}, ${PURPLE})` }}
            >
              See the live landing page →
            </a>
            <a
              href="#money"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 font-display text-sm font-black uppercase tracking-wide text-white/80 transition hover:border-white/50 hover:text-white"
            >
              How we both get paid
            </a>
          </div>
        </div>
      </section>

      {/* ── THE ATTRACTION OFFER ── */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="text-center text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: PURPLE_SOFT }}>
            It starts with the ad
          </div>
          <h2 className="mt-3 text-center font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            The attraction offer
          </h2>
          <div className="mt-6 rounded-3xl border border-white/12 bg-white/[0.02] p-6 sm:p-8">
            <p className="font-display text-2xl font-black leading-snug text-white sm:text-3xl">
              &ldquo;Thinking about coming to Cairns? Does your team need a reset?&rdquo;
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              We sell the Cairns experience, the reef, the helicopter, the golf, the food, the nightlife, then hit them
              with the hook: <span className="font-bold text-white">right now, we&apos;ll build you a custom itinerary
              to suit your team or your people.</span> Click the link to learn more.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              That ad runs on paid traffic across Australia and drives everyone to the landing page.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-white/10 px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: PURPLE_SOFT }}>
              The whole flow
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              From a scroll to a booked trip
            </h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FUNNEL.map((s) => (
              <div key={s.n} className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-black text-white"
                  style={{ background: PURPLE }}
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

      {/* ── THE LANDING PAGE ── */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border p-6 sm:p-8" style={{ borderColor: `${PURPLE}44`, background: `${PURPLE}0f` }}>
          <div className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: PURPLE_SOFT }}>
            First draft built
          </div>
          <h2 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
            The landing page
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Built in your branding. A video sells the dream, then a simple step-by-step form asks what they want to do,
            how many people, their dates and budget. Everything is designed to turn a cold click into a real, qualified
            enquiry that lands straight with me. It already lays out the full offer: everything handled, one package, one
            price, with a no-pressure guarantee.
          </p>
          <p className="mt-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs leading-relaxed text-white/55">
            Heads up: this is a rough first draft. It still needs the real images added and the video finished and
            tweaked, but it shows you exactly how the whole thing works.
          </p>
          <a
            href="/cairns-events"
            target="_blank"
            className="mt-5 inline-flex items-center justify-center rounded-full px-7 py-3.5 font-display text-sm font-black uppercase tracking-wide text-white transition hover:brightness-110 active:scale-95"
            style={{ background: PURPLE }}
          >
            Take a look →
          </a>
        </div>
      </section>

      {/* ── THE MONEY ── */}
      <section id="money" className="scroll-mt-4 border-t border-white/10 px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: PURPLE_SOFT }}>
              The important bit
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              How we both get paid
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
              You pay nothing for any of this. I fund the ads and do the selling. You only ever earn from it.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-white/12 bg-white/[0.02] p-6 sm:p-8">
            <div className="text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40">What a trip sells for</div>
              <div className="mt-2 font-display text-4xl font-black text-white sm:text-5xl">
                $10k <span className="text-white/35">to</span> $100k<span style={{ color: PURPLE_SOFT }}>+</span>
              </div>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">
                I negotiate the suppliers and price every trip at a premium, so you keep your bus fee{" "}
                <span className="font-bold text-white">plus extra margin on top</span>, more than a standard hire. It is
                all new business, at zero marketing cost to you.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                <div className="font-display text-xl font-black" style={{ color: GREEN }}>100%</div>
                <div className="mt-1 text-[11px] leading-snug text-white/55">new business you&apos;re not getting today</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                <div className="font-display text-xl font-black" style={{ color: GREEN }}>$0</div>
                <div className="mt-1 text-[11px] leading-snug text-white/55">your cost. I fund the marketing</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                <div className="font-display text-xl font-black" style={{ color: GREEN }}>More</div>
                <div className="mt-1 text-[11px] leading-snug text-white/55">you earn above your standard bus hire</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border p-6 text-center" style={{ borderColor: `${PURPLE}55`, background: `${PURPLE}14` }}>
              <div className="text-[11px] font-black uppercase tracking-[0.16em]" style={{ color: PURPLE_SOFT }}>
                What a year could look like
              </div>
              <div className="mt-2 font-display text-4xl font-black text-white sm:text-5xl">~$120,000+</div>
              <div className="mt-1 text-sm font-bold text-white/70">in new money you keep</div>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">
                Just two trips a month at a $25k average is around $120k a year in your pocket, on top of the pub crawls,
                hens, bucks and private hires the same marketing brings in. All of it money you are not making today.
              </p>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-white/45">
              Illustrative, real numbers depend on the trips. The point stands: every booking is new business you would
              not have had, it costs you nothing in marketing, and you keep your bus fee and your margin. My planning fee
              ($0 to $1,000) is paid to me separately by the client, on top.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
              <div className="font-display text-2xl font-black" style={{ color: PURPLE_SOFT }}>$0</div>
              <div className="mt-1 text-xs text-white/55">your marketing cost. I fund every ad.</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
              <div className="font-display text-2xl font-black" style={{ color: PURPLE_SOFT }}>20%</div>
              <div className="mt-1 text-xs text-white/55">my cut of revenue I bring you. You keep the rest.</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
              <div className="font-display text-2xl font-black" style={{ color: PURPLE_SOFT }}>New</div>
              <div className="mt-1 text-xs text-white/55">high-value bookings you are not getting today.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO DOES WHAT ── */}
      <section className="border-t border-white/10 px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: PURPLE_SOFT }}>
              Clear lanes
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              Who does what
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/12 bg-white/[0.02] p-6">
              <div className="font-display text-lg font-black uppercase" style={{ color: PURPLE_SOFT }}>
                I handle
              </div>
              <ul className="mt-4 flex flex-col gap-2.5">
                {ROLES_ME.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/80">
                    <span className="mt-0.5 shrink-0" style={{ color: PURPLE_SOFT }}>✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/[0.02] p-6">
              <div className="font-display text-lg font-black uppercase text-white">You handle</div>
              <ul className="mt-4 flex flex-col gap-2.5">
                {ROLES_PETE.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/80">
                    <span className="mt-0.5 shrink-0" style={{ color: GREEN }}>✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-5 text-center text-sm text-white/50">
            In short: I sell it and plan it. You deliver it and make the client&apos;s trip unforgettable.
          </p>
        </div>
      </section>

      {/* ── THE AGREEMENT ── */}
      <section className="border-t border-white/10 px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: PURPLE_SOFT }}>
              Straight and fair
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              The agreement
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
              A simple 12 month agreement so we can build this properly. Here is the shape of it. The full contract will
              be printed and signed by both of us.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {TERMS.map((t) => (
              <div key={t.t} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="font-display text-sm font-black text-white">{t.t}</div>
                <div className="mt-1 text-xs leading-relaxed text-white/55">{t.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE OPPORTUNITY ── */}
      <section className="border-t border-white/10 bg-black px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: PURPLE_SOFT }}>
            Why now
          </div>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            Nobody in Cairns is doing this
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/65">
            Cairns runs on tourism, over 2.7 million visitors a year and billions in spend, plus a growing corporate and
            events market. Right now that market is split up: one company does the reef, another the tours, another the
            weddings. No one packages the whole group experience into a single done-for-you trip. That is the gap we
            walk into, with the only double-decker party bus in Australia as the centrepiece.
          </p>
        </div>
      </section>

      {/* ── NEXT STEPS ── */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">Let&apos;s lock it in</h2>
          <p className="mx-auto mt-4 text-sm leading-relaxed text-white/65">
            Everything is built and ready. Let&apos;s go through the agreement together and get it signed. Once we do, I
            switch the ads on and we start filling that bus with the best trips Cairns has ever put together.
          </p>
          <a
            href="/cairns-events"
            target="_blank"
            className="mt-7 inline-flex items-center justify-center rounded-full px-8 py-4 font-display text-base font-black uppercase tracking-wide text-white transition hover:brightness-110 active:scale-95"
            style={{ background: `linear-gradient(90deg, ${PURPLE_DEEP}, ${PURPLE})`, boxShadow: `0 14px 40px -14px ${PURPLE}` }}
          >
            See it in action →
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <div className="font-display text-sm font-black uppercase tracking-[0.14em]" style={{ color: PURPLE_SOFT }}>
            THANYON
          </div>
          <p className="mt-2 text-xs text-white/30">Growth System · Prepared for Cairns Ultimate Party · Confidential</p>
        </div>
      </footer>
    </main>
  );
}
