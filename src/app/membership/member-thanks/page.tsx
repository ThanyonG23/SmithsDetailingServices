import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";
import MetaPixelEvent from "@/components/MetaPixelEvent";

export const metadata: Metadata = {
  title: "You're a Smiths Member",
  description: "Welcome to Smiths Member.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/membership/member-thanks" },
};

const LOGO = BUSINESS.logo;

const PERKS = [
  {
    n: "1",
    title: "Check your email",
    body: "Stripe just sent your receipt. That confirms you're a Smiths Member.",
  },
  {
    n: "2",
    title: "Your 10% off is live",
    body: "Book any detail or service and your member discount comes off the price. Just let us know you're a member.",
  },
  {
    n: "3",
    title: "You jump the queue",
    body: "Members get priority booking. When we're busy, you get seen first.",
  },
  {
    n: "4",
    title: "You're in the draw",
    body: "You're entered to win $1,000 cash or a $2,200 detail, drawn 14 Sept.",
  },
];

export default function MemberThanksPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <MetaPixelEvent event="Purchase" />
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-16 h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[130px]"
          style={{ background: "radial-gradient(closest-side, #FFE600, transparent 70%)" }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-xl px-5 pt-16 sm:pt-24">
          {/* header */}
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Detailing" className="mx-auto w-full max-w-[220px]" />

            {/* success tick */}
            <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-brand-yellow/40 bg-brand-yellow/10 shadow-glowY">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-yellow" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-yellow">
              You&apos;re signed up
            </div>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              You&apos;re a Smiths Member.
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-white/65">
              10% off everything, priority booking, and you&apos;re in every members&apos; draw. Here&apos;s how to use it.
            </p>
          </div>

          {/* perks / how to use */}
          <div className="mt-10 flex flex-col gap-3">
            {PERKS.map((p) => (
              <div
                key={p.n}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow font-display text-sm font-black text-brand-ink">
                  {p.n}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{p.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* draw reminder */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-brand-yellow/40 bg-gradient-to-br from-brand-yellow/[0.12] to-brand-yellow/[0.02] shadow-glowY">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/media/photos/giveaway.png"
              alt="Members' giveaway"
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-yellow">
                You&apos;re in the draw
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                Entered to win <b className="text-white">$1,000 cash</b> or a{" "}
                <b className="text-white">$2,200 detail</b>, drawn 14 Sept.{" "}
                <Link href="/draw-terms" className="text-brand-yellow underline underline-offset-4 transition hover:text-white">
                  See draw terms
                </Link>
                .
              </p>
            </div>
          </div>

          {/* book / contact */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
            <p className="text-sm leading-relaxed text-white/70">
              Ready to book a detail with your member discount? Text or call Thanyon.
            </p>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <a
                href={`sms:${BUSINESS.phoneE164}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3 font-display text-sm font-black text-brand-ink transition hover:brightness-110 active:scale-95"
              >
                Text {BUSINESS.phone}
              </a>
              <a
                href="/detailing"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-display text-sm font-bold text-white transition hover:border-white/40"
              >
                See services
              </a>
            </div>
          </div>
        </div>

        <footer className="mx-auto max-w-xl px-5 py-14 text-center text-sm text-white/40">
          <p>{BUSINESS.address}</p>
          <Link href="/" className="mt-2 inline-block text-white/50 underline underline-offset-4 transition hover:text-white">
            ← Back to home
          </Link>
        </footer>
      </div>
    </main>
  );
}
