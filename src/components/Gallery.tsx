import BeforeAfter from "./BeforeAfter";
import Reveal from "./Reveal";
import {
  TOUCHUP_BEFORE,
  TOUCHUP_AFTER,
  TOUCHUP_DOOR_BEFORE,
  TOUCHUP_DOOR_AFTER,
  HEADLIGHT_BEFORE,
  HEADLIGHT_AFTER,
} from "@/lib/config";

const ITEMS: {
  before: string;
  after: string;
  label: string;
  beforeScale?: number;
}[] = [
  { before: TOUCHUP_BEFORE, after: TOUCHUP_AFTER, label: "Touch-up paint" },
  { before: TOUCHUP_DOOR_BEFORE, after: TOUCHUP_DOOR_AFTER, label: "Kerb-rash repair" },
  {
    before: HEADLIGHT_BEFORE,
    after: HEADLIGHT_AFTER,
    label: "Headlight restoration",
    beforeScale: 1.15, // zoom the "before" in to match the after framing
  },
];

export default function Gallery() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <Reveal>
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Gallery
        </div>
        <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Before &amp; <span className="text-brand-yellow">after.</span>
        </h2>
        <p className="mt-4 max-w-md text-sm text-white/55">
          Real customer cars. Drag any slider to reveal the result.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it, i) => (
          <Reveal key={it.label} delay={100 * i}>
            <div className="mx-auto max-w-[360px]">
              <BeforeAfter before={it.before} after={it.after} beforeScale={it.beforeScale} />
              <div className="mt-3 flex items-center justify-between px-1">
                <span className="text-sm font-bold text-white/75">{it.label}</span>
                <span className="text-xs font-semibold text-white/35">⇆ Drag</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
