"use client";

/* Graceful fallback for any uncaught error under /ops, instead of the raw
   "Application error" screen, the team gets a friendly message + one-tap retry.
   The real error (with this digest) is in the Vercel function logs. */
export default function OpsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="text-4xl">🛠️</div>
      <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-white">
        That page hit a snag
      </h1>
      <p className="mt-2 text-sm text-white/55">
        Something didn&apos;t load right, usually a brief database hiccup. Tap to try again.
      </p>
      <button
        onClick={reset}
        className="mt-5 rounded-full bg-brand-green px-6 py-3 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95"
      >
        Try again
      </button>
      <a
        href="/ops"
        className="mt-3 text-xs font-bold text-white/45 transition hover:text-white"
      >
        Back to dashboard
      </a>
      {error?.digest && (
        <p className="mt-6 text-[11px] text-white/25">Ref: {error.digest}</p>
      )}
    </main>
  );
}
