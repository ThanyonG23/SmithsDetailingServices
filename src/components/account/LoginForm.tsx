"use client";

import { useState } from "react";
import { requestMagicLink } from "@/app/account/actions";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState(initialError || "");

  const submit = async () => {
    setError("");
    if (!email.includes("@")) {
      setError("Enter the email you signed up with.");
      return;
    }
    setState("sending");
    const res = await requestMagicLink(email);
    if (res.ok) {
      setState("sent");
    } else {
      setError(res.error || "Something went wrong, try again.");
      setState("idle");
    }
  };

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-brand-purple/40 bg-brand-purple/[0.08] p-6 text-center">
        <div className="text-3xl">📩</div>
        <div className="mt-2 font-display text-lg font-extrabold text-white">Check your email</div>
        <p className="mt-1.5 text-sm leading-relaxed text-white/60">
          If <b className="text-white/80">{email}</b> is a member, we&apos;ve sent a sign-in link. It&apos;s good for 30 minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-center text-sm text-white/55">
        Enter the email you signed up with and we&apos;ll send you a one-tap sign-in link. No password needed.
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="you@email.com"
          className="w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple"
        />
        <button
          onClick={submit}
          disabled={state === "sending"}
          className="rounded-full bg-brand-purple px-6 py-3 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {state === "sending" ? "Sending…" : "Email me a sign-in link →"}
        </button>
        {error && <div className="text-center text-xs font-semibold text-red-300">{error}</div>}
      </div>
    </div>
  );
}
