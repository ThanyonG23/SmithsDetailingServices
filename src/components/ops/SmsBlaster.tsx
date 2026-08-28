"use client";

import { useEffect, useMemo, useState } from "react";
import {
  sendTestSms,
  sendSmsBatch,
  optOutManual,
  optInManual,
  smsConfig,
  fixReplyCallback,
  type loadSmsData,
} from "@/app/ops/sms/actions";

type Data = Awaited<ReturnType<typeof loadSmsData>>;

const BATCH = 15; // sends per request, keeps each call well under the timeout
const FOOTER_LEN = 24; // "\n\nReply STOP to opt out."
const SINGLE_LIMIT = 160 - FOOTER_LEN; // chars before it splits / truncates

export default function SmsBlaster({ initial }: { initial: Data }) {
  const [body, setBody] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; sent: number; failed: number; blocked: number } | null>(null);
  const [finished, setFinished] = useState(false);
  const [unsubInput, setUnsubInput] = useState("");
  const [unsubs, setUnsubs] = useState(initial.unsubs);
  const [cfg, setCfg] = useState<Awaited<ReturnType<typeof smsConfig>> | null>(null);
  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    smsConfig().then(setCfg).catch(() => setCfg(null));
  }, []);

  async function fixStop() {
    setFixing(true);
    await fixReplyCallback();
    setCfg(await smsConfig());
    setFixing(false);
  }
  const stopConnected = !!cfg?.ok && cfg.numbers.length > 0 && cfg.numbers.every((n) => n.connected);

  const { recipients, stats } = initial;
  const overLimit = body.length > SINGLE_LIMIT;
  const hasSender = /smith/i.test(body);
  const remaining = SINGLE_LIMIT - body.length;

  const preview = useMemo(() => (body.trim() ? `${body.trim()}\n\nReply STOP to opt out.` : ""), [body]);

  async function runTest() {
    setTestMsg(null);
    const res = await sendTestSms(testPhone, body);
    setTestMsg(res.ok ? "✓ Test sent, check your phone." : `✗ ${res.error}`);
  }

  async function blast() {
    if (!body.trim() || sending) return;
    if (!confirm(`Send this SMS to ${recipients.length} people right now? This cannot be undone.`)) return;
    setSending(true);
    setFinished(false);
    const campaign = "blast-" + new Date().toISOString().slice(0, 16);
    let sent = 0,
      failed = 0,
      blocked = 0;
    for (let i = 0; i < recipients.length; i += BATCH) {
      const slice = recipients.slice(i, i + BATCH).map((r) => r.phone);
      try {
        const res = await sendSmsBatch(body, campaign, slice);
        sent += res.sent;
        failed += res.failed;
        blocked += res.blocked;
      } catch {
        failed += slice.length;
      }
      setProgress({ done: Math.min(i + BATCH, recipients.length), total: recipients.length, sent, failed, blocked });
      await new Promise((r) => setTimeout(r, 400)); // gentle throttle between batches
    }
    setSending(false);
    setFinished(true);
  }

  async function addUnsub() {
    if (!unsubInput.trim()) return;
    const res = await optOutManual(unsubInput);
    if (res.ok) {
      setUnsubs((u) => [{ phone: unsubInput.trim(), source: "manual", unsubscribed_at: "just now" }, ...u]);
      setUnsubInput("");
    }
  }
  async function removeUnsub(phone: string) {
    await optInManual(phone);
    setUnsubs((u) => u.filter((x) => x.phone !== phone));
  }

  const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Smiths members · Cairns</div>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        SMS <span className="text-brand-green">Blast</span>
      </h1>

      {/* stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { k: "Contactable", v: stats.contactable, tone: "text-brand-green" },
          { k: "Opted out", v: stats.unsubscribed, tone: "text-white/70" },
          { k: "Sent today", v: stats.sentToday, tone: "text-white/70" },
        ].map((s) => (
          <div key={s.k} className={`${CARD} p-4 text-center`}>
            <div className={`font-display text-2xl font-extrabold tabular-nums ${s.tone}`}>{s.v}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/40">{s.k}</div>
          </div>
        ))}
      </div>

      {/* reply-STOP health check */}
      {cfg && (
        <div className={`${CARD} mt-4 p-4 sm:p-5`}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Reply STOP setup</div>
            {stopConnected ? (
              <span className="text-xs font-black text-brand-green">✓ Connected</span>
            ) : (
              <button
                onClick={fixStop}
                disabled={fixing || !cfg.ok}
                className="rounded-full border border-brand-green/40 bg-brand-green/[0.08] px-4 py-1.5 text-xs font-bold text-brand-green transition hover:bg-brand-green/[0.16] disabled:opacity-40"
              >
                {fixing ? "Fixing…" : "Point STOP replies here"}
              </button>
            )}
          </div>
          {!cfg.ok ? (
            <p className="mt-2 text-xs text-brand-yellow">Couldn&apos;t check: {cfg.error}. Add the Telstra keys and redeploy.</p>
          ) : stopConnected ? (
            <p className="mt-2 text-xs text-white/50">When someone replies STOP they&apos;re added to the opt-out list automatically.</p>
          ) : (
            <p className="mt-2 text-xs text-brand-yellow">
              STOP replies aren&apos;t reaching this site yet, so opt-outs won&apos;t record. Tap the button to fix it, then send yourself a test and reply STOP to confirm.
            </p>
          )}
          {cfg.numbers.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-[11px] tabular-nums text-white/40">
              {cfg.numbers.map((n) => (
                <li key={n.number}>{n.number} {n.connected ? "✓ replies come here" : "→ not pointing here"}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* compose */}
      <div className={`${CARD} mt-5 p-4 sm:p-5`}>
        <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Your message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Hi, it's Smiths Detailing. First month of membership is just $1 and you go in the draw to win $1,000. Join: smithsdetailingservices.com.au/membership"
          className="mt-2 w-full resize-y rounded-xl border border-white/12 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={overLimit ? "font-bold text-brand-yellow" : "text-white/40"}>
            {remaining} left in one SMS {overLimit && "· longer messages cost/split"}
          </span>
          <span className="text-white/35">&ldquo;Reply STOP to opt out.&rdquo; is added automatically</span>
        </div>
        {!hasSender && body.trim() && (
          <div className="mt-2 rounded-lg border border-brand-yellow/40 bg-brand-yellow/[0.08] px-3 py-2 text-xs text-brand-yellow">
            ⚠ Say who it&apos;s from (e.g. &ldquo;Smiths&rdquo;). Required by law and it stops people reporting you as spam.
          </div>
        )}
        {preview && (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Preview</div>
            <div className="mt-1 whitespace-pre-line text-sm text-white/80">{preview}</div>
          </div>
        )}
      </div>

      {/* test send */}
      <div className={`${CARD} mt-4 p-4 sm:p-5`}>
        <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Test it on yourself first</label>
        <div className="mt-2 flex gap-2">
          <input
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="04xx xxx xxx"
            className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand-green"
          />
          <button
            onClick={runTest}
            disabled={!body.trim() || !testPhone.trim()}
            className="shrink-0 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-2.5 text-sm font-bold text-brand-green transition hover:bg-brand-green/[0.16] disabled:opacity-40"
          >
            Send test
          </button>
        </div>
        {testMsg && <div className="mt-2 text-xs text-white/70">{testMsg}</div>}
      </div>

      {/* blast */}
      <div className={`${CARD} mt-4 p-4 sm:p-5`}>
        {!finished ? (
          <>
            <button
              onClick={blast}
              disabled={!body.trim() || sending || recipients.length === 0}
              className="w-full rounded-full bg-brand-green px-8 py-4 font-display text-lg font-black text-[#04130a] shadow-[0_12px_45px_rgba(43,255,122,0.3)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? "Sending…" : `Send to ${recipients.length} people`}
            </button>
            {progress && (
              <div className="mt-4">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-white/55">
                  <span>{progress.done} / {progress.total}</span>
                  <span>✓ {progress.sent} · ✗ {progress.failed} · 🚫 {progress.blocked}</span>
                </div>
              </div>
            )}
            <p className="mt-3 text-center text-[11px] text-white/35">
              Opted-out numbers are skipped automatically. Only message people who gave you their number.
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="text-3xl">✅</div>
            <div className="mt-2 font-display text-xl font-extrabold text-white">Blast done</div>
            <div className="mt-1 text-sm text-white/60">
              ✓ {progress?.sent} sent · ✗ {progress?.failed} failed · 🚫 {progress?.blocked} opted-out skipped
            </div>
            <button onClick={() => { setFinished(false); setProgress(null); setBody(""); }} className="mt-4 rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white/70 hover:border-white/35 hover:text-white">
              New blast
            </button>
          </div>
        )}
      </div>

      {/* unsubscribes */}
      <div className={`${CARD} mt-4 p-4 sm:p-5`}>
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Opt-out list ({unsubs.length})</label>
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={unsubInput}
            onChange={(e) => setUnsubInput(e.target.value)}
            placeholder="Add a number to opt out"
            className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand-green"
          />
          <button onClick={addUnsub} className="shrink-0 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:border-red-500/50 hover:text-red-300">
            Opt out
          </button>
        </div>
        {unsubs.length > 0 && (
          <ul className="mt-3 flex flex-col divide-y divide-white/5">
            {unsubs.map((u) => (
              <li key={u.phone} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="tabular-nums text-white/75">{u.phone}</span>
                <span className="text-xs text-white/35">{u.source} · {u.unsubscribed_at}</span>
                <button onClick={() => removeUnsub(u.phone)} className="text-xs text-white/40 underline underline-offset-2 hover:text-white">
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
