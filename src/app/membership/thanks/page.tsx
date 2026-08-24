import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "You're in · Smiths Membership",
  description: "Welcome to the Smiths membership.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/membership/thanks" },
};

const LOGO = BUSINESS.logo;

const STEPS = [
  {
    n: "1",
    title: "Check your email",
    body: "Stripe just sent your receipt and subscription details. That confirms your spot as a founding member.",
  },
  {
    n: "2",
    title: "We'll text you to book",
    body: "Thanyon will message you within a day to lock in your first visit at a time that suits you.",
  },
  {
    n: "3",
    title: "First visit is the big one",
    body: "Full detail & service plus your free Cut & Polish to start. Then we keep your car clean and serviced on schedule, no thinking required.",
  },
];

export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-16 h-[460px] w-[460px] -translate-x-1/2 rounded-full opacity-[0.20] blur-[130px]"
          style={{ background: "radial-gradient(closest-side, #2bff7a, transparent 70%)" }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-xl px-5 pt-16 sm:pt-24">
          {/* header */}
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Detailing" className="mx-auto w-full max-w-[220px]" />

            {/* success tick */}
            <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-brand-green/40 bg-brand-green/10 shadow-[0_0_40px_-6px_rgba(43,255,122,0.55)]">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-green" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-green">
              Payment received
            </div>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              You&apos;re in.
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-white/65">
              Welcome to the Smiths membership. Hand us the keys and never think about your car again.
            </p>
          </div>

          {/* what happens next */}
          <div className="mt-10 flex flex-col gap-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green font-display text-sm font-black text-brand-ink">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-white">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* giveaway reminder */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-brand-yellow/40 bg-gradient-to-br from-brand-yellow/[0.12] to-brand-yellow/[0.02] shadow-glowY">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/media/photos/giveaway.png"
              alt="Members' giveaway"
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-yellow">
                You&apos;re now in the draw
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                As a member you&apos;re entered to win <b className="text-white">$1,000 cash</b> or a{" "}
                <b className="text-white">$2,200 detail</b>, drawn 14 Sept. We&apos;ll be in touch.
              </p>
            </div>
          </div>

          {/* reassurance / contact */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
            <p className="text-sm leading-relaxed text-white/70">
              Got a question before we reach out? Text or call Thanyon direct.
            </p>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <a
                href={`sms:${BUSINESS.phoneE164}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 font-display text-sm font-black text-brand-ink transition hover:brightness-110 active:scale-95"
              >
                Text {BUSINESS.phone}
              </a>
              <a
                href={`tel:${BUSINESS.phoneE164}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-display text-sm font-bold text-white transition hover:border-white/40"
              >
                Call us
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
