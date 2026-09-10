"use client";

import { useState } from "react";
import { setPassword } from "@/app/account/actions";

export default function SetPasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const save = async () => {
    setErr("");
    setMsg("");
    if (pw.length < 8) {
      setErr("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    const res = await setPassword(pw);
    setBusy(false);
    if (res.ok) {
      setMsg("Saved. You can now sign in with your email and password.");
      setPw("");
      setOpen(false);
    } else {
      setErr(res.error || "Couldn't save, try again.");
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-extrabold text-white">Password</h2>
          <p className="mt-0.5 text-sm text-white/55">
            {hasPassword ? "Change your password." : "Set a password so you can log in without waiting for an email."}
          </p>
        </div>
        {!open && (
          <button
            onClick={() => {
              setOpen(true);
              setMsg("");
            }}
            className="shrink-0 rounded-full border border-brand-purple/50 bg-brand-purple/[0.12] px-4 py-2 font-display text-xs font-black text-brand-purple-soft transition hover:brightness-110 active:scale-95"
          >
            {hasPassword ? "Change" : "Set password"}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-2.5">
          <input
            type="password"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="New password (8+ characters)"
            className="w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="rounded-full bg-brand-purple px-5 py-2.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save password"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setErr("");
                setPw("");
              }}
              className="rounded-full border border-white/15 px-5 py-2.5 font-display text-sm font-bold text-white/70 transition hover:border-white/40"
            >
              Cancel
            </button>
          </div>
          {err && <div className="text-xs font-semibold text-red-300">{err}</div>}
        </div>
      )}

      {msg && <div className="mt-3 text-xs font-semibold text-brand-green">{msg}</div>}
    </section>
  );
}
