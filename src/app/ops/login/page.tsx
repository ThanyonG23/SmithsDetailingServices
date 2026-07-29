import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/ops/auth";
import { login } from "../actions";

export default function OpsLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  if (isAuthed()) redirect("/ops");
  const failed = searchParams?.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        action={login}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.03] p-8"
      >
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-green">
          Smiths Detailing · Cairns
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white">
          Daily Ops
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Enter the team password to continue.
        </p>

        <input
          type="password"
          name="password"
          autoFocus
          required
          placeholder="Password"
          className="mt-6 w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-brand-green"
        />

        {failed && (
          <p className="mt-3 text-sm font-semibold text-red-400">
            Wrong password — try again.
          </p>
        )}

        <button
          type="submit"
          className="mt-5 w-full rounded-xl bg-brand-green px-4 py-3 font-bold text-black transition hover:brightness-110"
        >
          Log in
        </button>
      </form>
    </main>
  );
}
