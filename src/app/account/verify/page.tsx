import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BUSINESS } from "@/lib/config";
import { confirmLogin } from "@/app/account/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm sign in",
  robots: { index: false, follow: false },
};

/* The magic link lands here and shows a button. The token is only consumed when
   a human clicks "Confirm" (a POST), so email link-scanners that pre-fetch the
   URL (Outlook/Microsoft, Gmail, etc.) can't burn the single-use token first. */
export default function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams?.token || "";
  if (!token) redirect("/account?e=link");

  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="mx-auto max-w-md px-5 pt-20 text-center sm:pt-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BUSINESS.logo} alt="Smiths Detailing" className="mx-auto w-full max-w-[180px]" />
        <div className="mt-8 rounded-2xl border border-brand-purple/40 bg-brand-purple/[0.08] p-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Members</div>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white">Confirm sign in</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            You&apos;re one tap away. Click below to finish signing in to your Smiths members account.
          </p>
          <form action={confirmLogin} className="mt-5">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="w-full rounded-full bg-brand-purple px-6 py-3 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95"
            >
              Confirm sign in →
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
