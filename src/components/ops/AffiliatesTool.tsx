"use client";

import { useEffect, useMemo, useState } from "react";
import { listAffiliates, createAffiliate, deleteAffiliate, revsharePct, type Affiliate } from "@/app/ops/affiliates/actions";

/* Affiliate admin: create affiliates (each gets a share link), see who they've
   brought in and what you owe them this month, live from Stripe. */

const money = (cents: number) => "$" + (cents / 100).toFixed(2);

export default function AffiliatesTool() {
  const [rows, setRows] = useState<Affiliate[]>([]);
  const [pct, setPct] = useState(25);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    listAffiliates().then(setRows).catch(() => {});
    revsharePct().then(setPct).catch(() => {});
  }, []);

  const totals = useMemo(() => {
    const members = rows.reduce((a, r) => a + r.members, 0);
    const owed = rows.reduce((a, r) => a + r.owed_cents, 0);
    return { members, owed };
  }, [rows]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const res = await createAffiliate(name, email);
      if (res.ok && res.list) {
        setRows(res.list);
        setName("");
        setEmail("");
      } else {
        setErr(res.error || "Could not create affiliate.");
      }
    } catch {
      setErr("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function copy(text: string, tag: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(tag);
      setTimeout(() => setCopied((c) => (c === tag ? null : c)), 1500);
    }).catch(() => {});
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Affiliates <span className="text-brand-green">{pct}%</span>
      </h1>
      <p className="mt-1 text-sm text-white/45">
        Each affiliate gets a share link to the giveaway. When their referred members pay, they earn {pct}% of that member&apos;s
        payment every month, for as long as the member stays. Earnings below are live from Stripe.
      </p>

      {/* add */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">New affiliate</div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name or handle (becomes their code)"
            className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (for payout, optional)"
            className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
          />
          <button
            onClick={add}
            disabled={busy || !name.trim()}
            className="shrink-0 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-black text-[#04130a] transition hover:brightness-110 disabled:opacity-40"
          >
            {busy ? "…" : "Add"}
          </button>
        </div>
        {err && <div className="mt-2 text-xs font-semibold text-red-300">{err}</div>}
      </div>

      {/* totals */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Affiliates</div>
          <div className="mt-1 font-display text-3xl font-black text-white tabular-nums">{rows.length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Members referred</div>
          <div className="mt-1 font-display text-3xl font-black text-brand-purple-soft tabular-nums">{totals.members}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Owed / month</div>
          <div className="mt-1 font-display text-3xl font-black text-brand-green tabular-nums">{money(totals.owed)}</div>
        </div>
      </div>

      {/* list */}
      <div className="mt-6 flex flex-col gap-2.5">
        {rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/12 p-8 text-center text-sm text-white/40">
            No affiliates yet. Add one above and share their link.
          </div>
        )}
        {rows.map((a) => {
          const link = `${origin}/g/${a.code}`;
          const invite = `Win $1,000 cash (or a $2,200 detail) with Smiths in Cairns. Enter for just $1 here: ${link}`;
          return (
            <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-base font-extrabold text-white">{a.name}</div>
                  {a.email && <div className="text-xs text-white/45">{a.email}</div>}
                  <div className="mt-1 font-mono text-xs text-brand-green">/g/{a.code}</div>
                </div>
                <div className="flex shrink-0 gap-5 text-right">
                  <div><div className="font-display text-lg font-black text-brand-purple-soft tabular-nums">{a.members}</div><div className="text-[10px] uppercase tracking-wider text-white/40">members</div></div>
                  <div><div className="font-display text-lg font-black text-brand-green tabular-nums">{money(a.owed_cents)}</div><div className="text-[10px] uppercase tracking-wider text-white/40">/ month</div></div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => copy(link, `l${a.id}`)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-white/35 hover:text-white">
                  {copied === `l${a.id}` ? "Copied ✓" : "Copy link"}
                </button>
                <button onClick={() => copy(invite, `m${a.id}`)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-white/35 hover:text-white">
                  {copied === `m${a.id}` ? "Copied ✓" : "Copy invite message"}
                </button>
                <button onClick={() => { if (confirm("Remove this affiliate? Their Stripe code keeps working but they drop off this list.")) deleteAffiliate(a.id).then(setRows); }} className="ml-auto text-[11px] text-white/30 underline underline-offset-2 hover:text-white/70">
                  remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
