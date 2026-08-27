"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BUSINESS } from "@/lib/config";

/* Live members' draw, slot-machine reveal. Owner pastes the active member
   list (one per line), hits DRAW, and the reel spins down to a random winner
   with confetti. Built to be screen-recorded for socials. The pick uses
   crypto.getRandomValues so it's genuinely random, not Math.random. */

const STORAGE_KEY = "smiths-draw-entrants";
const PRIZE_KEY = "smiths-draw-prize";
const DECOY_KEY = "smiths-draw-decoys";
const BLEND_KEY = "smiths-draw-blend";

/* Filler names blended into the spin so the reel looks full on camera.
   These are NEVER eligible to win, the winner is only ever a real member. */
const DEFAULT_DECOYS = [
  "Jake M.", "Chloe R.", "Liam T.", "Sophie W.", "Ethan B.", "Mia H.",
  "Noah C.", "Ava P.", "Lucas D.", "Isla G.", "Cooper N.", "Ruby F.",
  "Riley S.", "Zoe K.", "Hunter L.", "Grace M.", "Max W.", "Ella T.",
  "Jack R.", "Chelsea B.", "Tyler J.", "Amber D.", "Blake H.", "Holly C.",
  "Nate P.", "Sienna W.", "Dylan M.", "Layla R.", "Brodie K.", "Tahlia S.",
  "Jayden F.", "Poppy N.", "Kai L.", "Willow G.", "Marcus T.", "Indi H.",
  "Reece B.", "Bella D.", "Josh W.", "Harper M.",
].join("\n");

type Phase = "idle" | "spinning" | "done";

function cryptoIndex(n: number): number {
  if (n <= 0) return 0;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}

// One CSV row into fields, respecting quotes and escaped quotes.
function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          q = false;
        }
      } else cur += ch;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else if (ch === '"') {
      q = true;
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

// A Stripe "subscriptions" export -> names of members whose sub is live.
function parseStripeCSV(text: string): { names: string[]; total: number } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { names: [], total: 0 };
  const header = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const iName = header.indexOf("customer name");
  const iEmail = header.indexOf("customer email");
  const iStatus = header.indexOf("status");
  const names: string[] = [];
  for (let r = 1; r < lines.length; r++) {
    const f = parseCSVLine(lines[r]);
    const status = iStatus >= 0 ? (f[iStatus] || "").trim().toLowerCase() : "active";
    // Only members whose subscription is currently live.
    if (status && status !== "active" && status !== "trialing") continue;
    let name = iName >= 0 ? (f[iName] || "").trim() : "";
    if (!name && iEmail >= 0) name = (f[iEmail] || "").trim().split("@")[0];
    if (name) names.push(name);
  }
  return { names, total: lines.length - 1 };
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
  const [decoyRaw, setDecoyRaw] = useState(DEFAULT_DECOYS);
  const [decoys, setDecoys] = useState<string[]>(parseEntrants(DEFAULT_DECOYS));
  const [blend, setBlend] = useState(true);
  const [rows, setRows] = useState<[string, string, string]>(["—", "—", "—"]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [fast, setFast] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [presenting, setPresenting] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [poster, setPoster] = useState<string | null>("/media/photos/mini-giveaway.png");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── load / persist ──
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      const savedPrize = localStorage.getItem(PRIZE_KEY);
      const savedDecoys = localStorage.getItem(DECOY_KEY);
      const savedBlend = localStorage.getItem(BLEND_KEY);
      if (savedRaw !== null) {
        setRaw(savedRaw);
        setEntrants(parseEntrants(savedRaw));
      }
      if (savedPrize !== null) setPrize(savedPrize);
      if (savedDecoys !== null) {
        setDecoyRaw(savedDecoys);
        setDecoys(parseEntrants(savedDecoys));
      }
      if (savedBlend !== null) setBlend(savedBlend === "1");
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

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const { names, total } = parseStripeCSV(text);
      if (names.length === 0) {
        setImportMsg("No active members found in that file. Check it's the Stripe subscriptions export.");
        return;
      }
      onRawChange(names.join("\n"));
      setImportMsg(`Imported ${names.length} active member${names.length === 1 ? "" : "s"} from ${total} row${total === 1 ? "" : "s"}.`);
    };
    reader.readAsText(file);
    e.target.value = ""; // let the same file be re-uploaded
  };

  const onPoster = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPoster(String(reader.result || ""));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onPrizeChange = (v: string) => {
    setPrize(v);
    try {
      localStorage.setItem(PRIZE_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const onDecoyChange = (v: string) => {
    setDecoyRaw(v);
    setDecoys(parseEntrants(v));
    try {
      localStorage.setItem(DECOY_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const onBlendChange = (v: boolean) => {
    setBlend(v);
    try {
      localStorage.setItem(BLEND_KEY, v ? "1" : "0");
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
    const colors = ["#a970ff", "#7c2ff5", "#FFE600", "#ffffff"];
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
    // The reel shows the full pool (real + filler) so it looks busy, but the
    // winner is only ever drawn from real members. Filler names can't win.
    const pool = blend && decoys.length > 0 ? [...entrants, ...decoys] : entrants;
    const rand = () => pool[cryptoIndex(pool.length)];
    const winnerName = entrants[cryptoIndex(entrants.length)];

    setPhase("spinning");
    setWinner(null);
    setCopied(false);

    const STEPS = entrants.length === 1 ? 20 : 34;
    let step = 0;
    let delay = 40;

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
      // Ramp up fast, then a long slow tail so the suspense builds and you can
      // read the last few names before it lands.
      delay = Math.min(delay * 1.18, 750);
      timerRef.current = setTimeout(tick, delay);
    };
    timerRef.current = setTimeout(tick, delay);
  }, [entrants, decoys, blend, phase, burstConfetti]);

  // What the audience sees as the pool size (real + filler when blending).
  const poolCount = blend && decoys.length > 0 ? entrants.length + decoys.length : entrants.length;

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

  // ── presentation (clean) mode ──
  useEffect(() => {
    const onFs = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFull = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  const getReady = () => {
    if (entrants.length === 0) return;
    reset();
    setPresenting(true);
  };

  const exitStage = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    setPresenting(false);
    reset();
  };

  const canDraw = entrants.length > 0 && phase !== "spinning";

  // ── the slot machine + controls, shared by the stage ──
  const Machine = (
    <>
      {/* prize banner */}
      {prize.trim() && (
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">Drawing for</div>
          <div className="mt-1 font-display text-2xl font-extrabold text-brand-yellow sm:text-3xl">{prize}</div>
        </div>
      )}

      <div className="relative mt-6">
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden />

        <div className="relative overflow-hidden rounded-3xl border border-brand-purple/50 bg-gradient-to-b from-brand-purple/[0.14] to-black/50 p-4 shadow-[0_0_80px_-12px_rgba(124,47,245,0.65)] sm:p-6">
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-2xl text-brand-purple-soft">▶</span>
          <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-2xl text-brand-purple-soft">◀</span>

          <div className="relative mx-auto flex h-[300px] max-w-md flex-col items-center justify-center gap-1 sm:h-[340px]">
            <div className={`h-14 w-full truncate text-center font-display text-2xl font-bold text-white/25 transition ${fast ? "blur-[2px]" : ""}`}>
              {rows[0]}
            </div>
            <div className="relative w-full">
              <div className="absolute inset-x-2 -top-1 h-px bg-brand-purple/60" aria-hidden />
              <div className="absolute inset-x-2 -bottom-1 h-px bg-brand-purple/60" aria-hidden />
              <div
                className={`flex h-20 w-full items-center justify-center rounded-xl bg-brand-purple/[0.10] px-3 text-center font-display font-black tracking-tight text-white transition-all ${
                  fast ? "blur-[3px]" : ""
                } ${phase === "done" ? "scale-110 text-brand-yellow drop-shadow-[0_0_18px_rgba(255,230,0,0.5)]" : ""}`}
                style={{ fontSize: "clamp(1.8rem, 7vw, 3rem)", lineHeight: 1 }}
              >
                <span className="truncate">{rows[1]}</span>
              </div>
            </div>
            <div className={`h-14 w-full truncate text-center font-display text-2xl font-bold text-white/25 transition ${fast ? "blur-[2px]" : ""}`}>
              {rows[2]}
            </div>
          </div>
        </div>

        {phase === "done" && winner && (
          <div className="mt-5 rounded-2xl border border-brand-yellow/50 bg-gradient-to-b from-brand-purple/[0.18] to-brand-yellow/[0.06] p-6 text-center shadow-[0_0_70px_-14px_rgba(255,230,0,0.55)]">
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-yellow">🎉 Winner 🎉</div>
            <div className="mt-2 font-display text-4xl font-black tracking-tight text-white sm:text-6xl">{winner}</div>
            {prize.trim() && <div className="mt-2 text-base font-bold text-brand-yellow">wins {prize}</div>}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        {phase !== "done" ? (
          <button
            onClick={draw}
            disabled={!canDraw}
            className="w-full max-w-sm rounded-full bg-brand-purple px-8 py-4 font-display text-lg font-black text-white shadow-[0_12px_45px_rgba(124,47,245,0.45)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {phase === "spinning" ? "Rolling…" : "DRAW WINNER"}
          </button>
        ) : (
          <div className="flex w-full max-w-md flex-wrap justify-center gap-2.5">
            <button onClick={reset} className="flex-1 rounded-full bg-brand-purple px-5 py-3 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95">
              Draw again
            </button>
            <button onClick={removeWinnerAndNext} className="flex-1 rounded-full border border-white/15 px-5 py-3 font-display text-sm font-bold text-white/80 transition hover:border-brand-purple hover:text-brand-purple-soft">
              Remove winner, draw next
            </button>
            <button onClick={copyWinner} className="rounded-full border border-white/15 px-5 py-3 font-display text-sm font-bold text-white/60 transition hover:border-white/35 hover:text-white">
              {copied ? "Copied ✓" : "Copy name"}
            </button>
          </div>
        )}
      </div>
    </>
  );

  // ═══ STAGE (clean, share-safe, on-brand) ═══
  if (presenting) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#08060f]">
        {/* branded background glows */}
        <div
          className="pointer-events-none fixed inset-x-0 top-0 h-[60vh]"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(124,47,245,0.30), transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 h-[40vh]"
          style={{ background: "radial-gradient(50% 100% at 50% 100%, rgba(255,230,0,0.08), transparent 70%)" }}
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-5">
          {/* top bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={exitStage}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/60 transition hover:border-white/35 hover:text-white"
            >
              ← Exit
            </button>
            <span className="rounded-full border border-brand-purple/40 bg-brand-purple/[0.12] px-4 py-1.5 text-sm font-bold text-brand-purple-soft">
              {poolCount} in the draw
            </span>
            <button
              onClick={toggleFull}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/60 transition hover:border-white/35 hover:text-white"
            >
              {isFull ? "Exit full screen" : "⛶ Full screen"}
            </button>
          </div>

          {/* branded header */}
          <div className="mt-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BUSINESS.logo} alt="Smiths" className="mx-auto h-11 w-auto sm:h-14" />
            <div className="mt-3 font-display text-2xl font-black uppercase tracking-[0.18em] text-white sm:text-3xl">
              Members&apos; <span className="text-brand-purple-soft">Draw</span>
            </div>
          </div>

          {/* poster (left) + draw (right) */}
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6 lg:flex-row lg:items-center lg:gap-8">
            {poster && (
              <div className="w-full max-w-md shrink-0 overflow-hidden rounded-2xl border border-brand-purple/40 shadow-[0_0_55px_-16px_rgba(124,47,245,0.6)] lg:w-[42%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={poster} alt="Prize" className="w-full object-cover" />
              </div>
            )}
            <div className="w-full lg:flex-1">{Machine}</div>
          </div>
        </div>
      </main>
    );
  }

  // ═══ SETUP (private, only you see this) ═══
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Smiths members</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Live <span className="text-brand-green">Draw</span>
        </h1>
        <p className="mt-2 text-sm text-white/45">
          Load your members here in private, then hit Get ready for a clean draw screen you can share.
        </p>
      </div>

      {/* ── setup ── */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">What they&apos;re winning</label>
        <input
          value={prize}
          onChange={(e) => onPrizeChange(e.target.value)}
          placeholder="$300 cash or a $400+ detail"
          className="mt-2 w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand-green"
        />

        <label className="mt-4 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
          Prize poster (optional, shows on the draw screen)
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-purple/40 bg-brand-purple/[0.08] px-4 py-2.5 text-sm font-bold text-brand-purple-soft transition hover:bg-brand-purple/[0.16]">
            🖼 Upload poster
            <input type="file" accept="image/*" className="hidden" onChange={onPoster} />
          </label>
          {poster && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster} alt="poster preview" className="h-10 w-16 rounded object-cover" />
              <button onClick={() => setPoster(null)} className="text-xs text-white/40 underline underline-offset-2 hover:text-white">
                Remove
              </button>
            </>
          )}
        </div>

        <label className="mt-4 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
          Active members
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-green/40 bg-brand-green/[0.06] px-4 py-2.5 text-sm font-bold text-brand-green transition hover:bg-brand-green/[0.12]">
            ⬆ Upload Stripe export (CSV)
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
          </label>
          {importMsg && <span className="text-xs text-white/55">{importMsg}</span>}
        </div>
        <p className="mt-1.5 text-xs text-white/35">
          Stripe → Subscriptions → Export. Only members with a live subscription get pulled in. Or type / paste names below, one per line.
        </p>
        <textarea
          value={raw}
          onChange={(e) => onRawChange(e.target.value)}
          rows={7}
          placeholder={"Sarah Lee\nBen Carter\nMick Dunn\n…"}
          className="mt-2 w-full resize-y rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={entrants.length > 0 ? "font-bold text-brand-green" : "text-white/40"}>
            {entrants.length} real member{entrants.length === 1 ? "" : "s"}, only these can win
          </span>
          {raw.trim() && (
            <button onClick={() => onRawChange("")} className="text-white/40 underline underline-offset-2 hover:text-white">
              Clear
            </button>
          )}
        </div>

        {/* ── filler names, make the reel look busy, never win ── */}
        <div className="mt-5 border-t border-white/10 pt-4">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
              Blend in filler names so the reel looks full
            </span>
            <input
              type="checkbox"
              checked={blend}
              onChange={(e) => onBlendChange(e.target.checked)}
              className="h-4 w-4 shrink-0 accent-brand-green"
            />
          </label>
          {blend && (
            <>
              <textarea
                value={decoyRaw}
                onChange={(e) => onDecoyChange(e.target.value)}
                rows={4}
                placeholder={"Jake M.\nChloe R.\n…"}
                className="mt-2 w-full resize-y rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white/80 outline-none placeholder:text-white/25 focus:border-brand-green"
              />
              <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                {decoys.length} filler names blended into the spin. They fill the reel so it looks busy, but
                they <b className="text-white/70">can never win</b>. The winner is always one of your{" "}
                {entrants.length} real member{entrants.length === 1 ? "" : "s"}.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── get ready ── */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={getReady}
          disabled={entrants.length === 0}
          className="w-full max-w-sm rounded-full bg-brand-green px-8 py-4 font-display text-lg font-black text-[#04130a] shadow-[0_12px_45px_rgba(43,255,122,0.3)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {entrants.length === 0 ? "Add members first" : "Get ready →"}
        </button>
        <p className="max-w-sm text-center text-xs leading-relaxed text-white/40">
          Opens a clean draw screen with the machine only. Your member list and filler names stay hidden, safe to
          screen-share or stream.
        </p>
      </div>
    </main>
  );
}
