import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";
import MetaPixelEvent from "@/components/MetaPixelEvent";

export const metadata: Metadata = {
  title: "You're in · Smiths",
  description: "Welcome to Smiths. You're a member and you're in the draws.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/membership/welcome" },
};

const LOGO = BUSINESS.logo;

/* Universal post-payment thank-you for every membership tier (Smiths Member,
   annual, Platinum, pass). Fires the Purchase pixel and points them to their
   account, which reads their real tier and entries live from Stripe. */
export default function MembershipWelcomePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <MetaPixelEvent event="Purchase" />
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-14 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-[0.20] blur-[130px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-lg px-5 pb-20 pt-16 sm:pt-24">
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Detailing" className="mx-auto w-full max-w-[210px]" />

            <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-brand-purple/50 bg-brand-purple/15 shadow-[0_0_50px_-8px_rgba(124,47,245,0.7)]">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-purple-soft" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">You&apos;re in</div>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Welcome to Smiths
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-white/65">
              You&apos;re a member, your entries are locked into every active draw, and your perks are live. Check your
              email for the receipt.
            </p>
          </div>

          {/* account access */}
          <div className="mt-10 rounded-2xl border border-brand-purple/40 bg-gradient-to-b from-brand-purple/[0.14] to-white/[0.02] p-6 text-center shadow-[0_0_60px_-24px_rgba(124,47,245,0.6)]">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">Your account</div>
            <h2 className="mt-1.5 font-display text-xl font-extrabold text-white">See your draws & perks</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/60">
              Sign in with the email you just used to see the draws you&apos;re in, your membership, and your perks. No
              password needed, we email you a one-tap link.
            </p>
            <Link
              href="/account"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-purple px-7 py-3 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95"
            >
              Go to your account →
            </Link>
          </div>

          {/* book / contact */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
            <p className="text-sm leading-relaxed text-white/70">
              Want to use your member discount on a detail? Text or call Thanyon.
            </p>
            <a
              href={`sms:${BUSINESS.phoneE164}`}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-brand-purple/50 bg-brand-purple/[0.12] px-6 py-3 font-display text-sm font-black text-brand-purple-soft transition hover:brightness-110 active:scale-95"
            >
              Text {BUSINESS.phone}
            </a>
          </div>
        </div>

        <footer className="mx-auto max-w-lg px-5 py-10 text-center text-sm text-white/40">
          <p>{BUSINESS.address}</p>
          <Link href="/membership" className="mt-2 inline-block text-white/50 underline underline-offset-4 transition hover:text-white">
            ← Back to membership
          </Link>
        </footer>
      </div>
    </main>
  );
}
