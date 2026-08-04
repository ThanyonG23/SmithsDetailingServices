"use client";

import { useState } from "react";

const INPUT =
  "w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green";

export default function LeadReplyHelper() {
  const [thread, setThread] = useState("");
  const [reply, setReply] = useState("");
  const [read, setRead] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!thread.trim() || loading) return;
    setLoading(true);
    setErr("");
    setReply("");
    setRead("");
    setCopied(false);
    try {
      const r = await fetch("/api/ai-reply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ thread }),
      });
      const d = await r.json();
      if (!r.ok) setErr(d.error || "Something went wrong.");
      else {
        setReply(d.reply || "");
        setRead(d.read || "");
      }
    } catch {
      setErr("Couldn't reach the AI — check your connection and try again.");
    }
    setLoading(false);
  };

  const copy = () => {
    if (!reply) return;
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="mt-10 rounded-2xl border border-brand-green/25 bg-brand-green/[0.03] p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <div className="text-sm font-bold text-white">Lead follow-up helper</div>
      </div>
      <p className="mt-1 text-xs text-white/50">
        Paste a customer&apos;s message thread from Meta and it writes a follow-up in Smiths&apos;
        voice. Read it, tweak if needed, then copy it across.
      </p>

      <textarea
        value={thread}
        onChange={(e) => setThread(e.target.value)}
        rows={6}
        placeholder={"Paste the whole conversation here — include names, dates/times if you have them…"}
        className={`${INPUT} mt-3 resize-y`}
      />

      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={generate}
          disabled={loading || !thread.trim()}
          className="rounded-full bg-brand-green px-5 py-2 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Writing…" : "Write a follow-up"}
        </button>
        {thread && (
          <button
            onClick={() => {
              setThread("");
              setReply("");
              setErr("");
            }}
            className="text-xs font-bold text-white/40 transition hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {err && (
        <div className="mt-3 rounded-lg border border-brand-yellow/40 bg-brand-yellow/[0.08] px-3 py-2 text-xs text-brand-yellow">
          {err}
        </div>
      )}

      {read && (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/55">
          <span className="font-bold text-white/40">📖 The read: </span>
          {read}
        </div>
      )}

      {reply && (
        <div className="mt-2 rounded-xl border border-white/12 bg-black/30 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Suggested reply</div>
            <button
              onClick={copy}
              className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-white/20 active:scale-95"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/85">{reply}</p>
        </div>
      )}
    </section>
  );
}
