"use client";

import { useRef, useState } from "react";

/* Self-hosted reels: click-to-play (no autoplay), clean video, no IG chrome. */
export default function Reels({ reels }: { reels: string[] }) {
  return (
    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3">
      {reels.map((src) => (
        <Reel key={src} src={src} />
      ))}
    </div>
  );
}

function Reel({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="relative aspect-[9/16] w-60 flex-none snap-start overflow-hidden rounded-2xl border border-white/12 bg-black sm:w-64">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        playsInline
        preload="metadata"
        controls={playing}
        onClick={toggle}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onEnded={() => setPlaying(false)}
      >
        <source src={`${src}#t=0.1`} type="video/mp4" />
      </video>

      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/15"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/40 backdrop-blur">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-white" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
