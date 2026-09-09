import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";
import MetaPixelEvent from "@/components/MetaPixelEvent";

export const metadata: Metadata = {
  title: "Welcome to the Garage Club",
  description: "You're in. Here's how to book your DIY detailing bay.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clubhouse/welcome" },
};

const LOGO = "/media/photos/smiths-garage-logo.png";

export default function ClubhouseWelcomePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <MetaPixelEvent event="Purchase" />
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-16 h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-[0.20] blur-[130px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-xl px-5 pt-16 sm:pt-24">
          {/* header */}
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Garage" className="mx-auto w-full max-w-[240px]" />

            {/* success tick */}
            <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-brand-purple/50 bg-brand-purple/15 shadow-[0_0_50px_-8px_rgba(124,47,245,0.7)]">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-purple-soft" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">
              You&apos;re in
            </div>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Welcome to the <span className="text-brand-purple-soft">Garage Club</span>
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-white/65">
              You&apos;re a founding early-access member. Check your email for the Stripe receipt, that confirms you&apos;re in.
            </p>
          </div>

          {/* book your bay */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-brand-purple/40 bg-gradient-to-b from-brand-purple/[0.14] to-white/[0.02] shadow-[0_0_70px_-24px_rgba(124,47,245,0.7)]">
            <div className="p-6 text-center sm:p-7">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">Book your bay</div>
              <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Book anytime, half day or full day
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                Want to detail your own car? Just call or text us and we&apos;ll lock in your bay for a half day or a full
                day, whenever suits you.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <a
                  href={`tel:${BUSINESS.phoneE164}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-purple px-7 py-3.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95"
                >
                  Call {BUSINESS.phone}
                </a>
                <a
                  href={`sms:${BUSINESS.phoneE164}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-purple/50 bg-brand-purple/[0.12] px-7 py-3.5 font-display text-sm font-black text-brand-purple-soft transition hover:brightness-110 active:scale-95"
                >
                  Text {BUSINESS.phone}
                </a>
              </div>
            </div>
          </div>

          {/* what's next */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
            <p className="text-sm leading-relaxed text-white/70">
              We&apos;re still building the rest of the club, the lounge, the events and more. As a founding member you&apos;ll
              be first to get access to everything as it opens, and you&apos;re in every members&apos; draw from today.
            </p>
          </div>
        </div>

        <footer className="mx-auto max-w-xl px-5 py-14 text-center text-sm text-white/40">
          <p>{BUSINESS.address}</p>
          <Link href="/clubhouse" className="mt-2 inline-block text-white/50 underline underline-offset-4 transition hover:text-white">
            ← Back to the club
          </Link>
        </footer>
      </div>
    </main>
  );
}
