import type { Metadata } from "next";
import Link from "next/link";

/* Post-purchase One-Time Offer (OTO) page. A DRAFT, not yet wired into the
   funnel. Tomorrow: (1) set the $1 membership Stripe link's success URL to
   /upgrade, (2) create the discounted Platinum-yearly one-time link/coupon and
   drop it into PLATINUM_OFFER_URL below. Until then this is previewable at
   /upgrade but nothing points to it and it's noindex. */

export const metadata: Metadata = {
  title: "One-time upgrade · Smiths",
  robots: { index: false, follow: false },
};

// TODO(tomorrow): replace with the real 20%-off one-time Platinum-yearly link.
// Placeholder = the standard $199 Platinum-yearly link so the button works while we tweak.
const PLATINUM_OFFER_URL = "https://buy.stripe.com/4gM14ndYsd258eI35F6kg0I";

export default function UpgradePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-8 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #FFE600, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-xl px-5 pb-20 pt-12 sm:pt-16">
          {/* Reassure the $1 purchase landed */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/[0.1] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-brand-green">
              ✓ You&apos;re in
            </span>
            <p className="mx-auto mt-3 max-w-sm text-sm text-white/60">
              Your membership is active and you&apos;re in this week&apos;s draw. But before you go…
            </p>
          </div>

          {/* Pattern interrupt + the tease */}
          <div className="mt-7 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Real quick, one-time offer</div>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl">
              This week&apos;s prize is big. <span className="text-brand-yellow">What&apos;s coming next is bigger.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/65">
              Get the best odds in every draw from here on, without lifting a finger. Upgrade to Platinum
              Yearly now and lock in <b className="text-white">10 entries into every single draw</b>, all year.
            </p>
          </div>

          {/* The offer card */}
          <div className="mt-8 rounded-3xl border border-brand-yellow/40 bg-gradient-to-b from-brand-yellow/[0.1] to-white/[0.02] p-6 shadow-glowY sm:p-8">
            <div className="text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-yellow">Platinum · yearly</div>
              <div className="mt-2 flex items-end justify-center gap-2">
                <span className="mb-1.5 font-display text-2xl font-bold text-red-400 line-through">$199</span>
                <span className="font-display text-5xl font-black text-white">$159</span>
                <span className="mb-1.5 text-xs font-bold text-white/50">/year</span>
              </div>
              <div className="mt-2 inline-flex items-center rounded-full bg-brand-yellow/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brand-yellow">
                20% off · only on this page
              </div>
            </div>

            <ul className="mx-auto mt-6 flex max-w-sm flex-col gap-3 text-sm text-white/85">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span>
                <span><b className="text-white">10 entries into every draw</b>, 10x your chances vs a standard member</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-brand-green">✓</span>
                <span><b className="text-white">20% off</b> all detailing (double the standard discount)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-brand-green">✓</span>
                <span>Priority access to everything we run</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-brand-green">✓</span>
                <span>Paid once for the year, so you never have to come back for it</span>
              </li>
            </ul>

            <a
              href={PLATINUM_OFFER_URL}
              className="mt-7 flex w-full items-center justify-center rounded-full bg-brand-yellow px-6 py-4 font-display text-base font-black text-brand-ink shadow-glowY transition hover:brightness-110 active:scale-95"
            >
              Yes, upgrade me to Platinum →
            </a>
            <p className="mt-3 text-center text-[11px] text-white/40">
              One-time offer. Cancel anytime. This price won&apos;t show again once you leave this page.
            </p>
          </div>

          {/* Easy, guilt-free decline */}
          <div className="mt-6 text-center">
            <Link
              href="/account"
              className="text-sm text-white/45 underline underline-offset-4 transition hover:text-white"
            >
              No thanks, I&apos;m happy with my membership →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
