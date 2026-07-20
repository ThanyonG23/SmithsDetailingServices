"use client";

import { useCallback, useRef, useState } from "react";

/* Draggable before/after comparison slider. The AFTER image is the base;
   the BEFORE image sits on top, clipped to the divider position, so
   dragging left↔right wipes between them. Works with mouse + touch via
   Pointer Events. */
export default function BeforeAfter({
  before,
  after,
  className = "",
}: {
  before: string;
  after: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [pos, setPos] = useState(50); // divider %, 0 = all after, 100 = all before

  const move = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let p = ((clientX - r.left) / r.width) * 100;
    p = Math.max(0, Math.min(100, p));
    setPos(p);
  }, []);

  return (
    <div
      ref={ref}
      className={`card-edge relative aspect-[3/4] w-full cursor-ew-resize select-none overflow-hidden rounded-3xl bg-black ${className}`}
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) move(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      {/* AFTER — base layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={after}
        alt="After"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      {/* BEFORE — clipped from the right by the divider */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before}
        alt="Before"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      {/* labels */}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
        Before
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand-green/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#04130a] backdrop-blur">
        After
      </span>

      {/* divider + handle */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{ left: `${pos}%` }}
        aria-hidden
      >
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.6)]" />
        <div className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/70 backdrop-blur">
          <span className="text-base leading-none text-white">⇆</span>
        </div>
      </div>
    </div>
  );
}
