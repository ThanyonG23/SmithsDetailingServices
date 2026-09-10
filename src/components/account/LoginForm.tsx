"use client";

import { useState } from "react";
import { requestMagicLink, loginWithPassword } from "@/app/account/actions";

const field =
  "w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError || "");
  const [sent, setSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [note, setNote] = useState("");

  const doPassword = async () => {
    setError("");
    if (!email.includes("@")) return setError("Enter your email.");
    if (!password) return setError("Enter your password.");
    setBusy(true);
    const res = await loginWithPassword(email, password);
    setBusy(false);
    if (res.ok) {
      window.location.href = "/account";
    } else {
      setError(res.error || "Couldn't sign you in.");
    }
  };

  const doMagic = async () => {
    setError("");
    if (!email.includes("@")) return setError("Enter your email.");
    setBusy(true);
    const res = await requestMagicLink(email);
    setBusy(false);
    if (res.ok) setSent(true);
    else setError(res.error || "Something went wrong, try again.");
  };

  const resend = async () => {
    setNote("");
    setResending(true);
    await requestMagicLink(email);
    setResending(false);
    setNote("Sent again, check your inbox (and spam).");
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-brand-purple/40 bg-brand-purple/[0.08] p-6 text-center">
        <div className="text-3xl">📩</div>
        <div className="mt-2 font-display text-lg font-extrabold text-white">Check your email</div>
        <p className="mt-1.5 text-sm leading-relaxed text-white/60">
          If <b className="text-white/80">{email}</b> is a member, we&apos;ve sent a sign-in link. It&apos;s good for 30 minutes.
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            onClick={resend}
            disabled={resending}
            className="rounded-full border border-brand-purple/50 bg-brand-purple/[0.12] px-6 py-2.5 font-display text-sm font-black text-brand-purple-soft transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {resending ? "Resending…" : "Resend link"}
          </button>
          <button
            onClick={() => {
              setSent(false);
              setNote("");
            }}
            className="text-xs font-semibold text-white/45 underline underline-offset-4 hover:text-white"
          >
            Back to sign in
          </button>
          {note && <div className="text-xs font-semibold text-brand-green">{note}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex flex-col gap-2.5">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={field}
        />

        {mode === "password" && (
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doPassword()}
            placeholder="Password"
            className={field}
          />
        )}

        <button
          onClick={mode === "password" ? doPassword : doMagic}
          disabled={busy}
          className="rounded-full bg-brand-purple px-6 py-3 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {busy ? "…" : mode === "password" ? "Sign in" : "Email me a sign-in link →"}
        </button>

        {error && <div className="text-center text-xs font-semibold text-red-300">{error}</div>}
      </div>

      <div className="mt-4 text-center">
        {mode === "password" ? (
          <button
            onClick={() => {
              setMode("magic");
              setError("");
            }}
            className="text-xs font-semibold text-brand-purple-soft underline underline-offset-4 hover:text-white"
          >
            First time, or forgot your password? Email me a link instead
          </button>
        ) : (
          <button
            onClick={() => {
              setMode("password");
              setError("");
            }}
            className="text-xs font-semibold text-brand-purple-soft underline underline-offset-4 hover:text-white"
          >
            Sign in with a password instead
          </button>
        )}
      </div>
    </div>
  );
}
