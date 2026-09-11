import type { Metadata } from "next";

/* Pre-purchase choice / upsell page. A DRAFT, not yet wired into the funnel.
   Flow (tomorrow): the "Join for $1" buttons point here first; here the member
   picks $1 membership OR the discounted Platinum yearly, side by side.
   TODO tomorrow: create the real 20%-off one-time Platinum-yearly Stripe link
   and drop it into PLATINUM_OFFER_URL. Until then the Platinum button uses the
   standard $199 link as a placeholder. Nothing points here yet; noindex. */

export const metadata: Metadata = {
  title: "Pick your plan · Smiths",
  robots: { index: false, follow: false },
};

const JOIN_1_URL = "https://buy.stripe.com/8x27sL07CaTX8eI35F6kg0z";
// TODO(tomorrow): swap for the real 20%-off ($159) one-time Platinum-yearly link.
const PLATINUM_OFFER_URL = "https://buy.stripe.com/4gM14ndYsd258eI35F6kg0I";

export default function UpgradePage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-8 h-[440px] w-[440px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #FFE600, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 pb-20 pt-12 sm:pt-16">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">One quick choice</div>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
              This week&apos;s prize is big. <span className="text-brand-yellow">What&apos;s coming next is bigger.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/65">
              Pick your plan. Most members go Platinum for <b className="text-white">10x the entries</b> in every draw,
              all year, so you never miss the big ones.
            </p>
          </div>

          <div className="mt-9 grid items-stretch gap-5 sm:grid-cols-2">
            {/* Option A: $1 member */}
            <div className="flex h-full flex-col rounded-3xl border border-white/12 bg-white/[0.03] p-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">Smiths Member</div>
              <div className="mt-3 flex items-end gap-2">
                <span className="mb-1.5 font-display text-lg font-bold text-red-400 line-through">$9.99</span>
                <span className="font-display text-4xl font-black text-white">$1</span>
                <span className="mb-1.5 text-xs font-bold text-white/50">first month</span>
              </div>
              <div className="mt-1 text-xs text-white/45">then $9.99/month · cancel anytime</div>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/80">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span>1 entry into every draw</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>10% off all detailing</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-white/70">✓</span>Priority booking</li>
              </ul>
              <a
                href={JOIN_1_URL}
                className="mt-6 flex w-full items-center justify-center rounded-full border border-white/20 px-6 py-3.5 font-display text-sm font-black text-white transition hover:border-white/50 active:scale-95"
              >
                Join for $1 →
              </a>
            </div>

            {/* Option B: Platinum yearly (recommended) */}
            <div className="relative flex h-full flex-col rounded-3xl border border-brand-yellow/50 bg-gradient-to-b from-brand-yellow/[0.12] to-white/[0.02] p-6 shadow-glowY">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-yellow px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-brand-ink">
                Most entries · best value
              </span>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-yellow">Platinum · yearly</div>
              <div className="mt-3 flex items-end gap-2">
                <span className="mb-1.5 font-display text-lg font-bold text-red-400 line-through">$199</span>
                <span className="font-display text-4xl font-black text-white">$159</span>
                <span className="mb-1.5 text-xs font-bold text-white/50">/year</span>
              </div>
              <div className="mt-1.5 inline-flex items-center self-start rounded-full bg-brand-yellow/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-yellow">
                20% off · only here
              </div>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/85">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-yellow">🎁</span><b className="text-white">10 entries into every draw</b></li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>20% off all detailing</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>Priority access to everything</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-brand-green">✓</span>Paid once, sorted for the year</li>
              </ul>
              <a
                href={PLATINUM_OFFER_URL}
                className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-yellow px-6 py-3.5 font-display text-sm font-black text-brand-ink shadow-glowY transition hover:brightness-110 active:scale-95"
              >
                Go Platinum · $159 →
              </a>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-md text-center text-[11px] leading-relaxed text-white/40">
            The Platinum price shown here is a one-time offer. Cancel anytime. Both plans put you in this week&apos;s draw.
          </p>
        </div>
      </div>
    </main>
  );
}
