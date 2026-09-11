"use client";

import { useEffect, useState } from "react";
import { ensureReferral } from "@/app/account/actions";

/* "Bring a Mate" card on the members dashboard. Loads the member's unique
   referral code on mount, shows a ready-to-send message, and a copy button.
   Also shows how many active mates they've brought in (their bonus entries). */

export default function ReferralCard() {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [link, setLink] = useState<string>("https://smithsdetailingservices.com.au/membership");
  const [mates, setMates] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"code" | "msg" | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await ensureReferral();
        if (!alive) return;
        if (res.ok && res.code) {
          setCode(res.code);
          if (res.link) setLink(res.link);
          setMates(res.mates ?? 0);
        } else {
          setError(res.error || "Couldn't load your code.");
        }
      } catch {
        if (alive) setError("Couldn't load your code.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const message = code
    ? `Get 10% off your first payment at Smiths with my code ${code}. Join here and enter it at checkout: ${link}. You go in the draws, I get a bonus entry. Sweet.`
    : "";

  const copy = async (what: "code" | "msg") => {
    const text = what === "code" ? code || "" : message;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard blocked, ignore */
    }
  };

  return (
    <section className="rounded-2xl border border-brand-green/40 bg-gradient-to-b from-brand-green/[0.10] to-white/[0.02] p-5 shadow-glowG">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">Bring a Mate</div>
        {mates > 0 && (
          <span className="rounded-full bg-brand-green/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-brand-green">
            🎁 +{mates} bonus {mates === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>
      <h2 className="mt-1.5 font-display text-xl font-extrabold text-white">Send a mate 10% off</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-white/60">
        Share your code. Your mate gets 10% off their first payment, and for as long as they stay a member you get a{" "}
        <span className="font-bold text-brand-green">🎁 bonus entry</span> in every eligible draw.
      </p>

      {loading ? (
        <div className="mt-4 h-11 w-full animate-pulse rounded-xl bg-white/5" />
      ) : error ? (
        <p className="mt-4 text-sm text-white/55">{error}</p>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-brand-green/30 bg-black/40 px-4 py-3 font-mono text-lg font-black tracking-[0.12em] text-brand-green">
              {code}
            </div>
            <button
              onClick={() => copy("code")}
              className="shrink-0 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-3 text-sm font-bold text-brand-green transition hover:bg-brand-green/[0.16] active:scale-95"
            >
              {copied === "code" ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => copy("msg")}
            className="mt-2.5 w-full rounded-xl bg-brand-green px-4 py-3 font-display text-sm font-black text-brand-ink transition hover:brightness-110 active:scale-95"
          >
            {copied === "msg" ? "Message copied" : "Copy invite message"}
          </button>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Steps</div>
            <ol className="mt-2 flex flex-col gap-1.5 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="font-black text-brand-green">1</span> Tap Copy invite message
              </li>
              <li className="flex gap-2">
                <span className="font-black text-brand-green">2</span> Go to your messages
              </li>
              <li className="flex gap-2">
                <span className="font-black text-brand-green">3</span> Paste
              </li>
              <li className="flex gap-2">
                <span className="font-black text-brand-green">4</span> Send
              </li>
            </ol>
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-white/40">
            Your mate enters <span className="font-bold text-white/60">{code}</span> at checkout. Their 10% off applies
            automatically.
          </p>
        </>
      )}
    </section>
  );
}
