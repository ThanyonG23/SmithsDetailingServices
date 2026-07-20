import { TEXT_TO_BOOK_HREF, BRING_BLACK_BACK_IMAGE } from "@/lib/config";
import Reveal from "./Reveal";

/* "Bring Black Back" — trim restoration. A single still that captures the
   whole story: one panel, half sun-faded grey, half restored factory black. */
export default function BringBlackBack() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
        {/* ── Text ── */}
        <div className="w-full min-w-0 md:flex-1">
          <Reveal>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              Trim restoration
            </div>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl">
              Bring black
              <br />
              <span className="text-brand-green">back.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
              Sun-faded bumpers, mirrors and trim make even a clean car look tired. We strip back
              the oxidation and restore that deep factory black — no greasy dressing that washes off
              in a week. One panel, mid-restore:
            </p>
            <a
              href={TEXT_TO_BOOK_HREF}
              className="mt-7 inline-flex items-center gap-2 text-sm font-black transition hover:gap-3"
            >
              <span className="text-brand-green">Text for a free quote</span>
              <span className="text-brand-green">→</span>
            </a>
          </Reveal>
        </div>

        {/* ── Photo ── */}
        <div className="w-full min-w-0 md:flex-1">
          <Reveal delay={120}>
            <div className="relative">
              <div className="halo-green pointer-events-none absolute -inset-10" aria-hidden />
              <div className="group card-edge shine relative aspect-[4/3] overflow-hidden rounded-3xl bg-black">
                <div
                  className="photo-zoom absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${BRING_BLACK_BACK_IMAGE})` }}
                  role="img"
                  aria-label="Trim restoration — faded grey on one side, factory black on the other"
                />
                <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/80 backdrop-blur">
                  Faded → Restored
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
