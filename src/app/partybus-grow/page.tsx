import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import OfferForm from "@/components/OfferForm";

/* Personalised growth-partner service page for Ultimate Party Cairns, the paid
   done-for-you version of /grow: we fill the bus, you pay only on bookings.
   Pure landing page. */

export const metadata: Metadata = {
  title: "Fill Your Bus | Ultimate Party Cairns × Smiths",
  description:
    "We set up and run all your marketing and sell the seats and hires for you. No upfront cost, you only pay a small cut of the bookings we make. If we don't book you 10 in your first 4 weeks, we work for free until we do.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/partybus-grow" },
};

const SETUP = [
  { t: "Social media accounts", d: "Set up and posting, so you actually show up online." },
  { t: "Facebook & Instagram ads", d: "Run and managed by us, targeted at locals and groups ready to book." },
  { t: "Google ads", d: "Catch the people already searching for a party bus in Cairns." },
  { t: "High-converting landing pages", d: "Built to turn clicks into booked seats and hires, not just visits." },
  { t: "AI automation", d: "Only the boring work, not the important things." },
];

const VALUE: { t: string; v: string }[] = [
  { t: "Facebook & Google ads, set up and managed", v: "$1,500/mo" },
  { t: "Social media, run and posted for you", v: "$1,500/mo" },
  { t: "A high-converting landing page", v: "$2,000 setup" },
  { t: "AI automation", v: "$500/mo" },
  { t: "A full-time salesperson to close every booking", v: "$1,000/wk+" },
  { t: "Advertising budget, funded by us", v: "$300/wk min" },
];

const OFFER = [
  { t: "Nothing upfront", d: "We build and run everything at our own cost, including the ad spend. You don't pay a cent to start." },
  { t: "We only take a small cut of the bookings we make you", d: "No bookings, no cost. We don't get paid unless you do." },
  { t: "One party bus in Cairns", d: "Once we build yours, we won't build a competitor's. First in, locks it in." },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "How are you actually making money?",
    a: "We take a small cut of the bookings we make you. That's it. No upfront fee, no retainer. If we don't book you anything, we don't earn a cent, which is exactly why we only take on businesses we know we can get results for. Our money is tied to yours.",
  },
  {
    q: "What's actually included?",
    a: "Everything. We set up and run your social media, your Facebook, Instagram and Google ads, your landing pages, and the AI automation. Then the leads come straight to us and we sell the seats and hires for you. You just drive the bus.",
  },
  {
    q: "What if it's a no-show or a cancellation?",
    a: "You never pay for a booking that doesn't happen. We only take our cut on bookings that actually go ahead. If a customer no-shows or cancels, that's our problem, not yours.",
  },
  {
    q: "How much does it cost?",
    a: "Nothing upfront. No setup fee, no monthly fee, no lock-in. The only time you pay is when we've actually made you a paying booking. No bookings, no cost.",
  },
  {
    q: "Who covers the ad spend?",
    a: "We do. You don't put a cent toward ads. We fund the advertising budget ourselves and only make it back through our small cut of the bookings we make you. That's how sure we are it'll work.",
  },
  {
    q: "What's the percentage?",
    a: "It depends on your seats and hires and what they're worth, so we lock it in together on the call and you'll always know exactly where you stand. It's a small cut, and it comes out of bookings you wouldn't have had otherwise.",
  },
];

export default function PartyBusGrowPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[10%] h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-14 text-center sm:pt-20">
          <Reveal delay={100}>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
              For Ultimate Party Cairns
            </div>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Want your bus booked out,
              <br className="hidden sm:block" />{" "}
              <span className="text-brand-purple-soft">without paying a marketing agency?</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              Someone to actually sell the seats and the private hires for you, so you never chase a booking again. You
              just drive the bus.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-purple px-8 py-3.5 font-display text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110 active:scale-95"
            >
              Fill my bus →
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── WHAT WE SET UP ── */}
      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
                What we set up for you
              </div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your whole booking engine, built and run for you
              </h2>
            </div>
          </Reveal>
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {SETUP.map((s, i) => (
              <Reveal key={s.t} delay={i * 60}>
                <div className="flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>
                  <div>
                    <div className="font-display text-base font-black text-white">{s.t}</div>
                    <div className="mt-1 text-sm text-white/55">{s.d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <p className="mx-auto mt-7 max-w-xl text-center text-base leading-relaxed text-white/70">
              Every lead comes <span className="font-semibold text-brand-purple-soft">straight to us</span>, and{" "}
              <span className="font-semibold text-brand-purple-soft">we sell them for you</span>. You never chase a lead
              or close a booking again.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── VALUE STACK ── */}
      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">What it&apos;s worth</div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                What this would normally cost you
              </h2>
            </div>
          </Reveal>
          <div className="mx-auto mt-8 max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            {VALUE.map((v, i) => (
              <div
                key={v.t}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${i > 0 ? "border-t border-white/10" : ""}`}
              >
                <span className="text-sm text-white/75 sm:text-base">{v.t}</span>
                <span className="shrink-0 font-display text-sm font-black tabular-nums text-white sm:text-base">{v.v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-brand-purple/40 bg-brand-purple/10 px-5 py-4">
              <span className="font-display text-sm font-black uppercase tracking-wide text-brand-purple-soft sm:text-base">
                Total value
              </span>
              <span className="shrink-0 font-display text-base font-black text-white sm:text-lg">$8,800+/month</span>
            </div>
          </div>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-md text-center text-base leading-relaxed text-white/70">
              Over <span className="font-black text-white">$8,800 a month</span> of work, plus setup.{" "}
              <span className="font-semibold text-brand-purple-soft">You pay none of it upfront.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── THE OFFER ── */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">The best part</div>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                No upfront cost. No risk. You only pay when we fill seats.
              </h2>
            </div>
          </Reveal>
          <div className="mx-auto mt-9 flex max-w-xl flex-col gap-3">
            {OFFER.map((item, i) => (
              <Reveal key={item.t} delay={i * 60}>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>
                  <div>
                    <div className="font-display text-base font-black text-white">{item.t}</div>
                    <div className="mt-1 text-sm text-white/55">{item.d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-brand-purple/45 bg-brand-purple/[0.1] p-6 text-center shadow-[0_0_44px_-16px_rgba(124,47,245,0.9)]">
              <div className="text-2xl">🛡️</div>
              <p className="mt-2 font-display text-xl font-black leading-snug text-white sm:text-2xl">
                If we don&apos;t make you at least 10 bookings in your first 4 weeks, we work for free until we do.
              </p>
              <p className="mt-2 text-sm text-white/60">No cut, no cost, nothing, until you&apos;re winning.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-y border-white/10 bg-white/[0.02] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="mb-8 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Questions</div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                The stuff you&apos;re probably wondering
              </h2>
            </div>
          </Reveal>
          <div className="flex flex-col gap-3">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 50}>
                <details className="group rounded-2xl border border-white/10 bg-black/20 p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-base font-black text-white">
                    {f.q}
                    <span className="shrink-0 text-xl leading-none text-brand-purple-soft transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / FORM ── */}
      <section id="contact" className="scroll-mt-6 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="mb-7 text-center">
              <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl">
                Let&apos;s get your bus <span className="text-brand-purple-soft">booked out.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/60">
                Once you accept, we&apos;ll sit down together and go through your whole business, your pricing, staff and
                bookings, so we can put together a proper proposal and the exact commission we&apos;d ask for.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <OfferForm
              source="partybus-grow"
              offerLabel="Ultimate Party Cairns, growth service (done-for-you bookings)"
              ctaLabel="Accept and book a sit-down →"
              heading="Accept and let's plan it"
              sub="Drop your details and we'll set a time to go through your business and put a proper proposal together."
              footnote="No upfront cost. You only pay a small cut of the bookings we make you."
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
