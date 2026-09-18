import type { Metadata } from "next";
import CairnsEventsForm from "@/components/CairnsEventsForm";

/* Cairns Ultimate Party exclusive-events funnel. Cold paid traffic lands here
   from a national ad, watches the VSL, then fills the progressive step-by-step
   form. No nav, built in Cairns Ultimate Party branding (fire-engine red #FF0000
   on black, white text) taken from ultimatepartycairns.com. Pure conversion
   page. Leads land in /ops tagged "partybus-events". Built inside the Smiths app
   for now so Thanyon can present the concept to Pete. */

export const metadata: Metadata = {
  title: "Cairns Ultimate Party | Exclusive Events",
  description:
    "Plan the ultimate Cairns getaway for your team, wedding or milestone. One package, fully done for you, by Cairns Ultimate Party.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cairns-events" },
};

const HANDLED = [
  { icon: "🚌", label: "Double-decker party bus" },
  { icon: "🐠", label: "Great Barrier Reef days" },
  { icon: "🚁", label: "Helicopter & scenic flights" },
  { icon: "🥩", label: "The best food in town" },
  { icon: "🍹", label: "Bars, clubs & nightlife" },
  { icon: "🏝️", label: "Stays & transfers sorted" },
];

const RED = "#ff0000";
const RED_DEEP = "#c20000";

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
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-white/45">
              Exclusive Events
            </div>
          </div>
          <a
            href="tel:0740410332"
            className="mt-2 text-sm font-bold text-white/70 transition hover:text-white sm:mt-0"
          >
            07 4041 0332
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 pt-12 pb-6 sm:pt-16">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[560px] -translate-x-1/2 rounded-full opacity-30 blur-[130px]"
          style={{ background: `radial-gradient(closest-side, ${RED}, transparent 70%)` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em]"
            style={{ borderColor: `${RED}66`, color: "#ff5a5a", background: `${RED}14` }}
          >
            🌴 The whole trip, planned for you
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[1.02] tracking-tight sm:text-6xl">
            The ultimate
            <br />
            <span style={{ color: RED }}>Cairns experience</span>,
            <br className="sm:hidden" /> built around you
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Great Barrier Reef days, helicopter flights, the best food in town, and our double-decker party bus tying it
            all together. You tell us the vibe, we plan and run the entire thing. One package, zero stress.
          </p>
        </div>
      </section>

      {/* ── VSL ── */}
      <section className="px-4 py-8">
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
      <section className="px-4 pt-4 pb-6">
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
          style={{ borderColor: `${RED}44`, background: `${RED}0d` }}
        >
          <span className="mt-0.5 shrink-0 text-lg">🛡️</span>
          <span className="text-sm leading-relaxed text-white/75">
            <span className="font-black text-white">One point of contact, one price.</span> We line up every venue,
            activity and booking so it all comes to you as a single package. You just show up and enjoy Cairns.
          </span>
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
