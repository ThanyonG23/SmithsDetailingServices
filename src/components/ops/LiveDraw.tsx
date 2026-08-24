"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Live members' draw, slot-machine reveal. Owner pastes the active member
   list (one per line), hits DRAW, and the reel spins down to a random winner
   with confetti. Built to be screen-recorded for socials. The pick uses
   crypto.getRandomValues so it's genuinely random, not Math.random. */

const STORAGE_KEY = "smiths-draw-entrants";
const PRIZE_KEY = "smiths-draw-prize";

type Phase = "idle" | "spinning" | "done";

function cryptoIndex(n: number): number {
  if (n <= 0) return 0;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}

function parseEntrants(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split("\n")) {
    const name = line.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

export default function LiveDraw() {
  const [raw, setRaw] = useState("");
  const [prize, setPrize] = useState("$300 cash or a $400+ detail");
  const [entrants, setEntrants] = useState<string[]>([]);
  const [rows, setRows] = useState<[string, string, string]>(["—", "—", "—"]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [fast, setFast] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [copied, setCopied] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── load / persist ──
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      const savedPrize = localStorage.getItem(PRIZE_KEY);
      if (savedRaw !== null) {
        setRaw(savedRaw);
        setEntrants(parseEntrants(savedRaw));
      }
      if (savedPrize !== null) setPrize(savedPrize);
    } catch {
      /* ignore */
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onRawChange = (v: string) => {
    setRaw(v);
    setEntrants(parseEntrants(v));
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const onPrizeChange = (v: string) => {
    setPrize(v);
    try {
      localStorage.setItem(PRIZE_KEY, v);
    } catch {
      /* ignore */
    }
  };

  // ── confetti ──
  const burstConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const colors = ["#2bff7a", "#FFE600", "#ffffff", "#7CFFB0"];
    const N = 160;
    const parts = Array.from({ length: N }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 120,
      y: H * 0.38 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -11 - 4,
      g: 0.28 + Math.random() * 0.12,
      s: 4 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
    }));
    let raf = 0;
    const start = performance.now();
    const draw = (t: number) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of parts) {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vx *= 0.99;
        if (p.y < H + 20) alive = true;
        const a = Math.max(0, 1 - elapsed / 2600);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }
      if (alive && elapsed < 2800) {
        raf = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── the draw ──
  const draw = useCallback(() => {
    if (entrants.length === 0 || phase === "spinning") return;
    const rand = () => entrants[cryptoIndex(entrants.length)];
    const winnerName = entrants[cryptoIndex(entrants.length)];

    setPhase("spinning");
    setWinner(null);
    setCopied(false);
    setShowSetup(false);

    const STEPS = entrants.length === 1 ? 12 : 34;
    let step = 0;
    let delay = 45;

    const tick = () => {
      step++;
      setFast(step < STEPS * 0.55);
      if (step >= STEPS) {
        setRows([rand(), winnerName, rand()]);
        setFast(false);
        setPhase("done");
        setWinner(winnerName);
        burstConfetti();
        timerRef.current = null;
        return;
      }
      setRows([rand(), rand(), rand()]);
      delay = Math.min(delay * 1.12, 520);
      timerRef.current = setTimeout(tick, delay);
    };
    timerRef.current = setTimeout(tick, delay);
  }, [entrants, phase, burstConfetti]);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    setWinner(null);
    setRows(["—", "—", "—"]);
  };

  const removeWinnerAndNext = () => {
    if (!winner) return;
    const next = entrants.filter((e) => e !== winner);
    const nextRaw = next.join("\n");
    onRawChange(nextRaw);
    reset();
  };

  const copyWinner = () => {
    if (!winner) return;
    navigator.clipboard?.writeText(winner).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {},
    );
  };

  const canDraw = entrants.length > 0 && phase !== "spinning";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Smiths members</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Live <span className="text-brand-green">Draw</span>
        </h1>
        <p className="mt-2 text-sm text-white/45">
          Paste your active members, hit draw, let it roll. Random and provably fair.
        </p>
      </div>

      {/* ── setup ── */}
      {showSetup ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">What they&apos;re winning</label>
          <input
            value={prize}
            onChange={(e) => onPrizeChange(e.target.value)}
            placeholder="$300 cash or a $400+ detail"
            className="mt-2 w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand-green"
          />
          <label className="mt-4 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
            Active members, one per line
          </label>
          <textarea
            value={raw}
            onChange={(e) => onRawChange(e.target.value)}
            rows={7}
            placeholder={"Sarah Lee\nBen Carter\nMick Dunn\n…"}
            className="mt-2 w-full resize-y rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={entrants.length > 0 ? "font-bold text-brand-green" : "text-white/40"}>
              {entrants.length} in the draw
            </span>
            {raw.trim() && (
              <button onClick={() => onRawChange("")} className="text-white/40 underline underline-offset-2 hover:text-white">
                Clear
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="rounded-full border border-white/12 bg-white/[0.03] px-4 py-1.5 text-sm font-bold text-white/70">
            {entrants.length} in the draw
          </span>
          <button
            onClick={() => setShowSetup(true)}
            className="text-sm text-white/45 underline underline-offset-4 hover:text-white"
          >
            Edit list
          </button>
        </div>
      )}

      {/* ── prize banner ── */}
      {prize.trim() && (
        <div className="mt-6 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-yellow/80">Drawing for</div>
          <div className="mt-1 font-display text-xl font-extrabold text-white sm:text-2xl">{prize}</div>
        </div>
      )}

      {/* ── the machine ── */}
      <div className="relative mt-5">
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          aria-hidden
        />

        <div className="relative overflow-hidden rounded-3xl border border-brand-yellow/40 bg-gradient-to-b from-brand-yellow/[0.10] to-black/40 p-4 shadow-[0_0_60px_-15px_rgba(255,230,0,0.4)] sm:p-6">
          {/* payline markers */}
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-2xl text-brand-green">▶</span>
          <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-2xl text-brand-green">◀</span>

          <div className="relative mx-auto flex h-[280px] max-w-md flex-col items-center justify-center gap-1 sm:h-[320px]">
            {/* top row */}
            <div className={`h-14 w-full truncate text-center font-display text-2xl font-bold text-white/30 transition ${fast ? "blur-[2px]" : ""}`}>
              {rows[0]}
            </div>
            {/* middle payline */}
            <div className="relative w-full">
              <div className="absolute inset-x-2 -top-1 h-px bg-brand-green/50" aria-hidden />
              <div className="absolute inset-x-2 -bottom-1 h-px bg-brand-green/50" aria-hidden />
              <div
                className={`flex h-20 w-full items-center justify-center rounded-xl bg-brand-green/[0.06] px-3 text-center font-display font-black tracking-tight text-white transition-all ${
                  fast ? "blur-[3px]" : ""
                } ${phase === "done" ? "scale-105 text-brand-green" : ""}`}
                style={{ fontSize: "clamp(1.8rem, 7vw, 3rem)", lineHeight: 1 }}
              >
                <span className="truncate">{rows[1]}</span>
              </div>
            </div>
            {/* bottom row */}
            <div className={`h-14 w-full truncate text-center font-display text-2xl font-bold text-white/30 transition ${fast ? "blur-[2px]" : ""}`}>
              {rows[2]}
            </div>
          </div>
        </div>

        {/* winner banner */}
        {phase === "done" && winner && (
          <div className="mt-5 rounded-2xl border border-brand-green/50 bg-brand-green/[0.08] p-5 text-center shadow-[0_0_50px_-18px_rgba(43,255,122,0.7)]">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-green">🎉 Winner</div>
            <div className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{winner}</div>
            {prize.trim() && <div className="mt-1 text-sm text-white/60">wins {prize}</div>}
          </div>
        )}
      </div>

      {/* ── controls ── */}
      <div className="mt-6 flex flex-col items-center gap-3">
        {phase !== "done" ? (
          <button
            onClick={draw}
            disabled={!canDraw}
            className="w-full max-w-sm rounded-full bg-brand-green px-8 py-4 font-display text-lg font-black text-[#04130a] shadow-[0_12px_45px_rgba(43,255,122,0.3)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {phase === "spinning" ? "Rolling…" : entrants.length === 0 ? "Add members to draw" : "DRAW WINNER"}
          </button>
        ) : (
          <div className="flex w-full max-w-md flex-wrap justify-center gap-2.5">
            <button
              onClick={reset}
              className="flex-1 rounded-full bg-brand-green px-5 py-3 font-display text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95"
            >
              Draw again
            </button>
            <button
              onClick={removeWinnerAndNext}
              className="flex-1 rounded-full border border-white/15 px-5 py-3 font-display text-sm font-bold text-white/80 transition hover:border-brand-green hover:text-brand-green"
            >
              Remove winner, draw next
            </button>
            <button
              onClick={copyWinner}
              className="rounded-full border border-white/15 px-5 py-3 font-display text-sm font-bold text-white/60 transition hover:border-white/35 hover:text-white"
            >
              {copied ? "Copied ✓" : "Copy name"}
            </button>
          </div>
        )}
      </div>

      <p className="mt-10 text-center text-[11px] text-white/25">
        Winner picked with the browser&apos;s cryptographic random generator. Refreshing keeps your pasted list.
      </p>
    </main>
  );
}
