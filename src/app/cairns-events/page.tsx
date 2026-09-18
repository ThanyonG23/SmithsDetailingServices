import type { Metadata } from "next";
import CairnsEventsForm from "@/components/CairnsEventsForm";

/* Cairns Party Bus exclusive-events funnel. Cold paid traffic lands here from a
   national ad, watches the VSL, then fills the progressive step-by-step form.
   No nav, Cairns Party Bus branding (pink/cyan), pure conversion page. Leads
   land in /ops tagged "partybus-events". Built inside the Smiths app for now so
   Thanyon can present the concept to Pete. */

export const metadata: Metadata = {
  title: "Cairns Party Bus | Exclusive Events",
  description:
    "Plan the ultimate Cairns getaway for your team, wedding or milestone. One package, fully done for you, by Cairns Party Bus.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cairns-events" },
};

const HANDLED = [
  { icon: "🚌", label: "Double-decker party bus" },
  { icon: "🐠", label: "Reef & island days" },
  { icon: "⛳", label: "Golf & go-karting" },
  { icon: "🥩", label: "The best food in town" },
  { icon: "🍹", label: "Bars & nightlife" },
  { icon: "🏝️", label: "Stays sorted" },
];

const PINK = "#ff2d78";
const CYAN = "#22d3ee";

export default function CairnsEventsPage() {
  return (
    <main className="min-h-screen bg-[#07060d] text-white">
      {/* ── brand bar (no menu) ── */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-4">
          {/* Swap this wordmark for Pete's actual logo once we have the file. */}
          <div className="text-center">
            <div className="font-display text-lg font-black tracking-[0.14em] text-white">CAIRNS PARTY BUS</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: CYAN }}>
              Exclusive Events
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 pt-12 pb-6 sm:pt-16">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[560px] -translate-x-1/2 rounded-full opacity-25 blur-[130px]"
          style={{ background: `radial-gradient(closest-side, ${PINK}, transparent 70%)` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em]"
            style={{ borderColor: `${CYAN}66`, color: CYAN, background: `${CYAN}12` }}
          >
            🌴 The whole trip, planned for you
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Plan the ultimate
            <br />
            <span style={{ color: PINK }}>Cairns getaway</span> for your team
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Reef days, golf, go-karting, the best food in town and a double-decker party bus to tie it all together. You
            tell us the vibe, we build and run the entire thing. One package, zero stress.
          </p>
        </div>
      </section>

      {/* ── VSL ── */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div
            className="relative aspect-video w-full overflow-hidden rounded-3xl border"
            style={{ borderColor: `${PINK}55`, boxShadow: `0 24px 90px -30px ${PINK}99` }}
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
              style={{ background: "linear-gradient(135deg, #16121f, #0b0a12)" }}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: `linear-gradient(135deg, ${PINK}, ${CYAN})` }}
              >
                <span className="ml-1 text-2xl">▶</span>
              </div>
              <div className="mt-4 font-display text-sm font-black uppercase tracking-[0.2em] text-white/70">
                Your VSL goes here
              </div>
              <div className="mt-1 max-w-xs text-xs text-white/35">
                Reef, go-karting, bikes, the best steak in town, all of Cairns
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM (the star) ── */}
      <section className="px-4 pt-4 pb-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-5 text-center">
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Get your custom plan
            </h2>
            <p className="mt-2 text-sm text-white/55">
              Answer a few quick questions and we&apos;ll call you to build it around exactly what you want.
            </p>
          </div>
          <CairnsEventsForm />
        </div>
      </section>

      {/* ── WHAT'S HANDLED ── */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-white/40">
            Everything handled, one package
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {HANDLED.map((h) => (
              <div
                key={h.label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3.5"
              >
                <span className="text-xl">{h.icon}</span>
                <span className="text-sm font-semibold text-white/80">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REASSURANCE ── */}
      <section className="px-4 pb-14">
        <div
          className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border px-5 py-4"
          style={{ borderColor: `${CYAN}44`, background: `${CYAN}0d` }}
        >
          <span className="mt-0.5 shrink-0 text-lg">🛡️</span>
          <span className="text-sm leading-relaxed text-white/75">
            <span className="font-black text-white">One point of contact, one price.</span> We line up every venue,
            activity and booking so it all comes to you as a single package. You just show up and enjoy Cairns.
          </span>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Cairns Party Bus · Exclusive Events</p>
        </div>
      </footer>
    </main>
  );
}
