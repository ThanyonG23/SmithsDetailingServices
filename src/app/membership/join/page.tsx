import type { Metadata } from "next";
import Link from "next/link";
import MembershipJoin from "@/components/MembershipJoin";
import ReviewsSection from "@/components/ReviewsSection";
import Countdown from "@/components/Countdown";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Join · Smiths Membership",
  description: "Become a founding Smiths member.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/membership/join" },
};

const LOGO = BUSINESS.logo;
const DRAW_TIME = "2026-09-14T12:00:00+10:00";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #2bff7a, transparent 70%)" }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-xl px-5 pt-14 sm:pt-20">
          {/* header */}
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Detailing" className="mx-auto w-full max-w-[240px]" />
            <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-green">
              Founding membership · Cairns
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              You&apos;re almost in
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-white/60">
              Enter your details, pick your vehicle, and you&apos;re a founding member. Takes two minutes.
            </p>
          </div>

          {/* trust strip */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <span className="tracking-tight text-brand-yellow">★★★★★</span> <b className="font-bold text-white">100+</b> 5-star reviews
            </span>
            <span className="inline-flex items-center gap-1.5">💯 Not happy, you don&apos;t pay</span>
            <span className="inline-flex items-center gap-1.5">Cancel anytime</span>
          </div>

          {/* giveaway + bonus reminder */}
          <div className="mt-7 overflow-hidden rounded-2xl border border-brand-yellow/40 bg-gradient-to-br from-brand-yellow/[0.12] to-brand-yellow/[0.02] shadow-glowY">
            <div className="flex flex-col sm:flex-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/media/photos/giveaway.png"
                alt="Members' giveaway"
                className="h-32 w-full object-cover sm:h-auto sm:w-40"
              />
              <div className="flex flex-1 flex-col justify-center gap-1.5 p-4 sm:p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-yellow">
                  Join today, you&apos;re in the draw
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  Win <b className="text-white">$1,000 cash</b> or a <b className="text-white">$2,200 detail</b>, drawn 14 Sept. Plus a free Cut &amp; Polish for the next 10 founding members.
                </p>
                <div className="mt-1.5">
                  <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-yellow/80">Drawn in</div>
                  <Countdown target={DRAW_TIME} />
                </div>
              </div>
            </div>
          </div>

          {/* the form + vehicle cards */}
          <div className="mt-7">
            <MembershipJoin />
          </div>
        </div>

        {/* social proof */}
        <ReviewsSection />

        <footer className="mx-auto max-w-xl px-5 py-12 text-center text-sm text-white/40">
          <p>{BUSINESS.address}</p>
          <Link href="/membership" className="mt-2 inline-block text-white/50 underline underline-offset-4 transition hover:text-white">
            ← Back to the membership
          </Link>
        </footer>
      </div>
    </main>
  );
}
