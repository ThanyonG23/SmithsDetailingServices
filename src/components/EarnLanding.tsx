"use client";

import { useState } from "react";
import { signupAffiliate } from "@/app/ops/affiliates/actions";

/* Public affiliate-recruitment landing (/earn). A grand-slam offer to potential
   affiliates: 25% recurring for as long as their referrals stay, free to join,
   self-serve. On signup it mints their code and flips to a "you're in" state
   with their link, caption and dashboard. */

export default function EarnLanding() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [social, setSocial] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = code ? `${origin}/g/${code}` : "";
  const caption = code ? `Win $1,000 cash (or a $2,200 detail) with Smiths in Cairns 🚗 enter for just $1 AND get double entries through my link: ${link}` : "";

  async function join() {
    setBusy(true);
    setErr("");
    try {
      const res = await signupAffiliate(name, email, social);
      if (res.ok && res.code) setCode(res.code);
      else setErr(res.error || "Something went wrong.");
    } catch {
      setErr("Something went wrong, please try again.");
    } finally {
      setBusy(false);
    }
  }

  function copy(text: string, tag: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(tag);
      setTimeout(() => setCopied((c) => (c === tag ? null : c)), 1600);
    }).catch(() => {});
  }

  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[620px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 pb-24 pt-16 sm:pt-24">

          {!code ? (
            <>
              {/* HERO OFFER */}
              <div className="text-center">
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-purple-soft">Smiths partner program</div>
                <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl">
                  Get paid every month<br />for sharing a <span className="text-brand-green">$1 giveaway</span>.
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                  Earn <b className="text-white">25% of everything</b> your referrals pay us, recurring, for as long as they stay a
                  member. Free to join. No cap on what you earn.
                </p>
              </div>

              {/* VALUE STACK */}
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {[
                  ["🔁", "25% recurring", "Not a one-off. You earn every month they stay a member."],
                  ["🆓", "Free to join", "No cost, no catch, 60 seconds to set up."],
                  ["🔗", "Just share a link", "Drop your code in your bio, posts or stories."],
                  ["📈", "No cap", "Refer 10 or 10,000. You get paid on all of them."],
                ].map(([icon, t, d]) => (
                  <div key={t} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="text-2xl leading-none">{icon}</div>
                    <div className="mt-2 font-display text-lg font-extrabold text-white">{t}</div>
                    <div className="mt-1 text-sm leading-relaxed text-white/60">{d}</div>
                  </div>
                ))}
              </div>

              {/* YOUR EXCLUSIVE */}
              <div className="mt-6 rounded-2xl border border-brand-yellow/40 bg-brand-yellow/[0.08] p-6 text-center">
                <div className="font-display text-xl font-extrabold text-white">🎁 Your exclusive: double entries</div>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-white/70">
                  Everyone who joins through your link gets <b className="text-brand-yellow">double the entries</b> in every draw.
                  That is a real reason for your audience to use your link and not just enter on their own. Only you can offer it.
                </p>
              </div>

              {/* WHY IT CONVERTS */}
              <div className="mt-4 rounded-2xl border border-brand-green/30 bg-brand-green/[0.06] p-6 text-center">
                <div className="font-display text-xl font-extrabold text-white">The easiest thing you&apos;ll ever get someone to click</div>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-white/70">
                  &ldquo;Enter to win $1,000 for $1&rdquo; sells itself. Send us 100 members and you earn around
                  <b className="text-brand-green"> $250 every month</b>, on autopilot, whether you post again or not.
                </p>
              </div>

              {/* WHAT YOU EARN */}
              <div className="mt-12">
                <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-white">What you earn per referral</h2>
                <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-white/60">
                  Our memberships go up to $24.99/month, so a single referral can pay you up to{" "}
                  <b className="text-brand-green">$75 a year</b>, every year they stay. No cap on how many you refer.
                </p>
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                  <div className="grid grid-cols-3 bg-white/[0.04] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-white/45">
                    <div>Member joins</div><div>They pay</div><div className="text-right">You earn (25%)</div>
                  </div>
                  {[
                    ["Smiths Member", "$9.99/mo", "$2.50/mo"],
                    ["Platinum", "$24.99/mo", "$6.25/mo"],
                    ["Annual", "$99/yr", "$24.75/yr"],
                    ["Platinum Annual", "$199/yr", "$49.75/yr"],
                  ].map(([plan, pay, earn], i) => (
                    <div key={plan} className={`grid grid-cols-3 px-4 py-3.5 text-sm ${i % 2 ? "bg-white/[0.01]" : ""}`}>
                      <div className="font-bold text-white">{plan}</div>
                      <div className="text-white/60">{pay}</div>
                      <div className="text-right font-black text-brand-green">{earn}</div>
                    </div>
                  ))}
                </div>
                <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-white/60">
                  Most people join on the $1 offer, then upgrade to Platinum for better odds, and your 25% grows with them,
                  automatically. Refer 20 Platinum members and that&apos;s <b className="text-white">$125 a month</b>, on repeat.
                </p>
              </div>

              {/* HOW IT WORKS */}
              <div className="mt-12">
                <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-white">How it works</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    ["1", "Sign up free", "Enter your details below and get your unique code instantly."],
                    ["2", "Share your link", "Put it in your bio, posts, stories, wherever your people are."],
                    ["3", "Get paid monthly", "25% of every member you send, for as long as they stay."],
                  ].map(([n, t, d]) => (
                    <div key={n} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                      <div className="font-display text-3xl font-black text-brand-purple-soft">{n}</div>
                      <div className="mt-2 font-display text-base font-extrabold text-white">{t}</div>
                      <div className="mt-1 text-sm leading-relaxed text-white/60">{d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIGNUP */}
              <div id="join" className="mt-12 rounded-3xl border border-brand-purple/45 bg-gradient-to-b from-brand-purple/[0.12] to-white/[0.02] p-6 shadow-[0_0_60px_-24px_rgba(124,47,245,0.6)] sm:p-8">
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">Start earning today</h2>
                <p className="mt-1 text-sm text-white/60">Free, and you&apos;ll have your link in seconds.</p>
                <div className="mt-5 flex flex-col gap-3">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name or handle"
                    className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple-soft" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email (so we can pay you)"
                    className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple-soft" />
                  <input value={social} onChange={(e) => setSocial(e.target.value)} placeholder="Where will you share it? (Instagram, TikTok, mates...)"
                    className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple-soft" />
                  {err && <div className="text-sm font-semibold text-red-300">{err}</div>}
                  <button onClick={join} disabled={busy || !name.trim() || !email.trim()}
                    className="mt-1 flex w-full items-center justify-center rounded-full bg-brand-green px-8 py-4 font-display text-base font-black uppercase tracking-[0.1em] text-[#04130a] transition hover:brightness-110 active:scale-95 disabled:opacity-40">
                    {busy ? "Setting you up…" : "Get my link →"}
                  </button>
                  <p className="text-center text-[11px] text-white/40">Free forever. Cancel any time. Paid monthly.</p>
                </div>
              </div>
            </>
          ) : (
            /* SUCCESS STATE */
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-green">You&apos;re in</div>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Your link is ready. Go get paid. 💸
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-white/65">
                Share this everywhere. Every member who joins through it earns you 25%, every month, for as long as they stay.
              </p>

              <div className="mt-8 rounded-2xl border border-brand-purple/45 bg-brand-purple/[0.08] p-6">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Your link</div>
                <div className="mt-2 break-all font-mono text-lg font-bold text-brand-green">{link}</div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button onClick={() => copy(link, "link")} className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-black text-[#04130a] transition hover:brightness-110">
                    {copied === "link" ? "Copied ✓" : "Copy link"}
                  </button>
                  <button onClick={() => copy(caption, "cap")} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition hover:border-white/45">
                    {copied === "cap" ? "Copied ✓" : "Copy a ready-made caption"}
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Your code</div>
                <div className="mt-1 font-mono text-2xl font-black text-brand-purple-soft">{code}</div>
                <p className="mt-2 text-sm text-white/55">Bookmark your dashboard to watch your earnings roll in:</p>
                <a href={`/affiliate/${code}`} className="mt-2 inline-block font-bold text-brand-green underline underline-offset-4">
                  View my dashboard →
                </a>
              </div>

              <p className="mt-8 text-sm text-white/50">Tip: pin it to your Instagram bio and mention it in a story. &ldquo;Win $1k for $1&rdquo; is an easy sell.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
