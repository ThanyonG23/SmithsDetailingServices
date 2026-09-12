import type { Metadata } from "next";
import { BUSINESS } from "@/lib/config";

/* Thank-you / welcome page for a new Platinum partner. Set this as the success
   URL on both Platinum Stripe payment links (monthly + annual). Noindex. */

export const metadata: Metadata = {
  title: "Welcome to Platinum · Smiths",
  robots: { index: false, follow: false },
};

const GETS = [
  "A full content shoot day at your business every month",
  "Everything posted across our socials every week, all month",
  "A personalised batch of content sent to you, ready to post on your own socials",
  "Featured in our giveaways and offered as a member discount",
  "Links to your site on our website and members portal",
];

export default function PartnerWelcomePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-8 h-[440px] w-[440px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-xl px-5 pb-20 pt-16 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/[0.1] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-brand-green">
            ✓ You&apos;re a Smiths partner
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl">
            Welcome to the team.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/65">
            Thanks for partnering with Smiths. We&apos;ll be in touch <b className="text-white">within 24 hours</b> to lock in
            your first content day and walk through your plan. Nothing else to do right now.
          </p>

          {/* What happens next */}
          <div className="mt-8 rounded-2xl border border-brand-purple/40 bg-gradient-to-b from-brand-purple/[0.12] to-white/[0.02] p-6 text-left shadow-[0_0_60px_-24px_rgba(124,47,245,0.6)]">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-purple-soft">What happens next</div>
            <ol className="mt-3 flex flex-col gap-3">
              {[
                "We call you to book your first full content day.",
                "Our team comes out and shoots a batch of content at your business.",
                "It goes live across our socials, and we send you a personalised batch to post on yours too.",
              ].map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-purple font-display text-xs font-black text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-white/80">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* What you're getting */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-green">What you&apos;re getting</div>
            <ul className="mt-3 flex flex-col gap-2">
              {GETS.map((g) => (
                <li key={g} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/80">
                  <span className="mt-0.5 shrink-0 text-brand-green">✓</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-7 text-sm text-white/55">
            Can&apos;t wait? Call Thanyon now on{" "}
            <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-brand-purple-soft underline underline-offset-4 transition hover:text-white">
              {BUSINESS.phone}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
