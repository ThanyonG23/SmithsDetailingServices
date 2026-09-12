"use client";

import { useEffect, useState } from "react";
import { getAffiliatePublic } from "@/app/ops/affiliates/actions";

/* An affiliate's own dashboard at /affiliate/[code]. Shows their live earnings
   and share tools. The code is the key (stats aren't sensitive), no login. */

const money = (c: number) => "$" + (c / 100).toFixed(2);

export default function AffiliateDashboard({ code }: { code: string }) {
  const [data, setData] = useState<{ name: string; code: string; members: number; owed_cents: number } | null>(null);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    getAffiliatePublic(code).then((d) => (d ? setData(d) : setMissing(true))).catch(() => setMissing(true));
  }, [code]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/g/${code}`;
  const caption = `Win $1,000 cash (or a $2,200 detail) with Smiths in Cairns 🚗 enter for just $1 here: ${link}`;

  function copy(text: string, tag: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(tag);
      setTimeout(() => setCopied((c) => (c === tag ? null : c)), 1600);
    }).catch(() => {});
  }

  if (missing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050506] px-6 text-center">
        <div>
          <div className="font-display text-2xl font-extrabold text-white">Link not found</div>
          <p className="mt-2 text-white/60">That code doesn&apos;t exist. Want to join?</p>
          <a href="/earn" className="mt-4 inline-block rounded-full bg-brand-green px-6 py-3 font-display text-sm font-black text-[#04130a]">Become an affiliate →</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-16">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-purple-soft">Your dashboard</div>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {data ? `Hey ${data.name.split(" ")[0]}` : "Loading…"}
        </h1>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Active members</div>
            <div className="mt-1 font-display text-4xl font-black text-brand-purple-soft tabular-nums">{data?.members ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-brand-green/30 bg-brand-green/[0.06] p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Earning / month</div>
            <div className="mt-1 font-display text-4xl font-black text-brand-green tabular-nums">{money(data?.owed_cents ?? 0)}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-brand-purple/45 bg-brand-purple/[0.08] p-6">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Your link</div>
          <div className="mt-2 break-all font-mono text-base font-bold text-brand-green">{link}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => copy(link, "l")} className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-black text-[#04130a] transition hover:brightness-110">{copied === "l" ? "Copied ✓" : "Copy link"}</button>
            <button onClick={() => copy(caption, "c")} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition hover:border-white/45">{copied === "c" ? "Copied ✓" : "Copy caption"}</button>
          </div>
        </div>

        <p className="mt-6 text-sm text-white/50">
          You earn 25% of what every active member you referred pays, every month, for as long as they stay. The more you share,
          the more this grows. Bookmark this page to check back any time.
        </p>
      </div>
    </main>
  );
}
