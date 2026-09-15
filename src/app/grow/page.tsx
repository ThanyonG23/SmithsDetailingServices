import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import GrowthLeadForm from "@/components/GrowthLeadForm";

/* Growth-partner service landing page. Cold traffic from DMs/emails lands here.
   Full 100M-offer structure: dream outcome, deliverables, real proof, a stacked
   risk-reversal, speed and exclusivity, then a simple call-booking form.
   Noindex, it's a direct-link page, not for search. */

export const metadata: Metadata = {
  title: "We Fill Your Calendar | Smiths",
  description:
    "We set up and run all your marketing and sell the jobs for you. No upfront cost, you only pay a small cut of the jobs we book. If we don't book you 10 jobs in your first 4 weeks, we work for free until we do.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/grow" },
};

// A real recent week from our own detailing calendar, customer names removed.
const WEEK: { day: string; jobs: { t: string; premium?: boolean }[] }[] = [
  { day: "Mon", jobs: [{ t: "7am · Full Detail + Cut & Polish", premium: true }, { t: "9am · Full Detail + Cut & Polish", premium: true }] },
  { day: "Tue", jobs: [{ t: "6am · Exterior + Cut & Polish", premium: true }, { t: "7am · Full Detail", premium: true }, { t: "7am · Full Detail" }, { t: "11am · Full Detail" }] },
  { day: "Wed", jobs: [{ t: "6am · Full Detail", premium: true }, { t: "7am · Full Detail" }, { t: "9am · Full Detail" }, { t: "11am · Full Detail" }] },
  { day: "Thu", jobs: [{ t: "6am · Full Detail", premium: true }, { t: "7am · Full Detail", premium: true }, { t: "8am · Full Detail + Cut & Polish", premium: true }, { t: "9am · Full Detail" }] },
  { day: "Fri", jobs: [{ t: "6am · Full Detail" }, { t: "7am · Full Detail", premium: true }, { t: "9am · Full Detail" }] },
];

const SETUP = [
  { t: "Social media accounts", d: "Set up and posting, so you actually show up online." },
  { t: "Facebook ads", d: "Run and managed by us, targeted at local customers ready to book." },
  { t: "Google ads", d: "Catch the people already searching for what you do." },
  { t: "High-converting landing pages", d: "Built to turn clicks into booked jobs, not just visits." },
  { t: "AI automation", d: "Only the boring work, not the important things." },
];

const VALUE: { t: string; v: string }[] = [
  { t: "Facebook & Google ads, set up and managed", v: "$1,500/mo" },
  { t: "Social media, run and posted for you", v: "$1,500/mo" },
  { t: "A high-converting landing page", v: "$2,000 setup" },
  { t: "AI automation", v: "$500/mo" },
  { t: "A full-time salesperson to close every lead", v: "$1,000/wk+" },
  { t: "Advertising budget, funded by us", v: "$300/wk min" },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "How are you actually making money?",
    a: "I take a small cut of the jobs I book you. That's it. No upfront fee, no retainer. If I don't book you jobs, I don't earn a cent, which is exactly why I only take on businesses I know I can get results for. My money is tied to yours.",
  },
  {
    q: "What's actually included?",
    a: "Everything. I set up and run your social media, your Facebook and Google ads, your landing pages, and the AI automation. Then the leads come straight to me and I sell them for you. You don't build anything, run anything, or chase anyone. You just do the work.",
  },
  {
    q: "What if it's a no-show or a cancellation?",
    a: "You never pay for a job that doesn't happen. I only take my cut on jobs that actually go ahead. If a customer no-shows or cancels, that's my problem, not yours. I also handle the confirmations and reminders to keep no-shows low in the first place.",
  },
  {
    q: "How much does it cost?",
    a: "Nothing upfront. No setup fee, no monthly fee, no lock-in. The only time you pay is when I've actually booked you a paying job. No jobs, no cost.",
  },
  {
    q: "Who covers the ad spend?",
    a: "We do. You don't put a cent toward ads. We fund the advertising budget ourselves and only make it back through our small cut of the jobs we book you. That's how sure we are it'll work.",
  },
  {
    q: "What's the percentage?",
    a: "It depends on your trade and what a job is worth, so we lock it in together on the call and you'll always know exactly where you stand. It's a small cut, and because we usually sell your service for a bit more than you charge now, it tends to come out of the extra, not out of your pocket.",
  },
];

export default function GrowLanding() {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[10%] h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-14 text-center sm:pt-20">
          <Reveal delay={100}>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
              For service businesses
            </div>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Want your calendar filled consistently,
              <br className="hidden sm:block" />{" "}
              <span className="text-brand-purple-soft">without paying a marketing agency?</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              Someone to actually sell the jobs for your business, so you never have to worry about
              finding work or chasing customers again. You just show up and do what you&apos;re good at.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-purple px-8 py-3.5 font-display text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110 active:scale-95"
            >
              Fill my calendar →
            </a>
          </Reveal>
        </div>
      </section>

      {/* ═══ WHAT WE SET UP ═══ */}
      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
                What we set up for you
              </div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your whole customer engine, built and run for you
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
              <span className="font-semibold text-brand-purple-soft">we sell them for you</span>. You never chase a lead or
              close a job again. You just turn up to the work.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ PROOF ═══ */}
      <section className="border-y border-white/10 bg-white/[0.02] px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Why us</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              We&apos;ve actually done this ourselves
            </h2>
            <p className="mx-auto mt-5 text-base leading-relaxed text-white/70">
              We built and run every bit of this for our own business, Smiths Detailing, with 100+ five-star reviews. And
              it&apos;s not just cars. We&apos;ve done it for lawn mowing and cleaning too, so we know exactly what it takes
              to keep a business booked out.
            </p>
          </Reveal>
        </div>

        {/* A real booked-out week from our own calendar */}
        <Reveal delay={120}>
          <div className="mx-auto mt-10 max-w-4xl">
            <div className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">
              A recent week in our own calendar
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="grid min-w-[620px] grid-cols-5 gap-2">
                {WEEK.map((d) => (
                  <div key={d.day}>
                    <div className="mb-2 text-center text-[11px] font-black uppercase tracking-wider text-white/50">{d.day}</div>
                    <div className="flex flex-col gap-2">
                      {d.jobs.map((j, i) => (
                        <div
                          key={i}
                          className={`rounded-lg px-2.5 py-2 text-left text-[11px] font-bold leading-tight ${
                            j.premium
                              ? "bg-brand-purple text-white"
                              : "border border-brand-purple/30 bg-brand-purple/20 text-white/90"
                          }`}
                        >
                          {j.t}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-white/40">
              A real week from our own detailing calendar. Customer names removed for privacy.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ═══ VALUE STACK ═══ */}
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

      {/* ═══ THE OFFER / RISK REVERSAL ═══ */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
                The best part
              </div>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                No upfront cost. No risk. You only pay when we bring you jobs.
              </h2>
            </div>
          </Reveal>
          <div className="mx-auto mt-9 flex max-w-xl flex-col gap-3">
            {[
              { t: "Nothing upfront", d: "We build and run everything at our own cost. You don't pay a cent to start." },
              { t: "We only take a small cut of the jobs we book you", d: "No jobs, no cost. Our incentives are locked to yours, we don't get paid unless you do." },
              { t: "Live in just a few days", d: "Not weeks. We move fast and get your customer engine running quickly." },
              { t: "One business per trade, per area", d: "Once we build yours, we won't build a competitor's. First in, locks it in." },
            ].map((item, i) => (
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

          {/* The guarantee */}
          <Reveal delay={120}>
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-brand-purple/45 bg-brand-purple/[0.1] p-6 text-center shadow-[0_0_44px_-16px_rgba(124,47,245,0.9)]">
              <div className="text-2xl">🛡️</div>
              <p className="mt-2 font-display text-xl font-black leading-snug text-white sm:text-2xl">
                If we don&apos;t book you at least 10 jobs in your first 4 weeks, we work for free until we do.
              </p>
              <p className="mt-2 text-sm text-white/60">No cut, no cost, nothing, until you&apos;re winning.</p>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-brand-yellow/45 bg-brand-yellow/[0.08] p-6 text-center shadow-glowY">
              <div className="text-2xl">💰</div>
              <p className="mt-2 font-display text-lg font-black leading-snug text-brand-yellow sm:text-xl">
                It won&apos;t even cost you a cent out of pocket.
              </p>
              <p className="mt-2 text-sm text-white/70">
                We&apos;ll most likely sell your service for more than you charge now, so our cut comes out of the extra,
                not out of your pocket.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="border-y border-white/10 bg-white/[0.02] px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">How it works</div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Three steps and you&apos;re booked out
              </h2>
            </div>
          </Reveal>
          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[
              { n: "1", t: "Quick call", d: "We learn your business and what a good job looks like for you." },
              { n: "2", t: "We build it all", d: "Ads, pages, socials and automation, live in a few days." },
              { n: "3", t: "You get booked", d: "Leads come to us, we sell them, you turn up and do the work." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple font-display text-base font-black text-white">
                    {s.n}
                  </div>
                  <div className="mt-4 font-display text-lg font-black text-white">{s.t}</div>
                  <div className="mt-2 text-sm text-white/55">{s.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
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

      {/* ═══ CONTACT / FORM ═══ */}
      <section id="contact" className="scroll-mt-16 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="mb-7 text-center">
              <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl">
                Interested? Let&apos;s get you <span className="text-brand-purple-soft">booked out.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/60">
                Fill out your details and I&apos;ll give you a call to walk you through exactly how it works. No obligation.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <GrowthLeadForm />
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER (minimal, no navigation away) ═══ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Smiths Detailing Services ·{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition hover:text-white/60">
              Privacy
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
