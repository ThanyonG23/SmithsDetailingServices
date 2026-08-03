import { redirect } from "next/navigation";
import { getRole } from "@/lib/ops/auth";
import { login } from "../actions";

export default function OpsLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const role = getRole();
  if (role === "owner") redirect("/ops");
  if (role === "crew") redirect("/ops/team");
  const failed = searchParams?.error === "1";

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <form
          action={login}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm"
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Smiths Detailing · Cairns
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white">
            Daily <span className="text-brand-yellow">Ops</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            Enter the team password to continue.
          </p>

          <input
            type="password"
            name="password"
            autoFocus
            required
            placeholder="Password"
            className="mt-6 w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-brand-green"
          />

          {failed && (
            <p className="mt-3 text-sm font-semibold text-red-400">
              Wrong password — try again.
            </p>
          )}

          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-brand-green px-6 py-3.5 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95"
          >
            Log in →
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white/25">
          Private team page
        </p>
      </div>
    </main>
  );
}
