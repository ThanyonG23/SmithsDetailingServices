"use client";

import { useRef, useState } from "react";
import { TEXT_TO_BOOK_HREF, TRIM_VIDEO } from "@/lib/config";
import Reveal from "./Reveal";

/* "Bring Black Back" — trim restoration feature. A vertical clip that
   autoplays muted + looping (it's a transformation, so motion sells it);
   tap the video for sound. */
export default function BringBlackBack() {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleSound() {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  }

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
              in a week.
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

        {/* ── Video ── */}
        <div className="w-full min-w-0 md:flex-1">
          <Reveal delay={120}>
            <div className="relative mx-auto max-w-[300px]">
              <div className="pointer-events-none absolute -inset-10 halo-green" aria-hidden />
              <button
                type="button"
                onClick={toggleSound}
                aria-label={muted ? "Tap for sound" : "Mute"}
                className="card-edge relative block aspect-[9/16] w-full overflow-hidden rounded-3xl bg-black"
              >
                <video
                  ref={ref}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src={TRIM_VIDEO} type="video/mp4" />
                </video>
                <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                  {muted ? "🔇 Tap for sound" : "🔊"}
                </span>
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
