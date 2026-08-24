import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers";

/* Value stack + straight-to-Stripe vehicle picker. Used on the sign-up page
   once the member has been sold on the call. Numbers live here — edit in one place. */
const VALUE_STACK: { label: string; value: string; highlight?: boolean }[] = [
  { label: "Full detail, every 3 months", value: "Included" },
  { label: "Full service, every 6 months", value: "Included" },
  { label: "FREE Cut & Polish to start", value: "$750+", highlight: true },
  { label: "Entry to win $1,000 cash", value: "Drawn 14 Sept", highlight: true },
  { label: "10% off all add-on services", value: "Ongoing" },
  { label: "Priority booking, members first", value: "Included" },
];

export default function MembershipCheckout() {
  return (
    <div className="h-full rounded-3xl border border-brand-green/45 bg-gradient-to-b from-brand-green/[0.08] to-white/[0.02] p-6 shadow-[0_14px_60px_-18px_rgba(43,255,122,0.32)] sm:p-8">
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">Ready to book?</div>
        <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Here&apos;s everything you get
        </h2>
      </div>

      <ul className="mt-6 flex flex-col divide-y divide-white/10">
        {VALUE_STACK.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 py-2.5">
            <span className="flex items-start gap-2.5 text-sm text-white/85">
              <span className="mt-0.5 shrink-0 text-brand-green">✓</span>
              <span>{s.label}</span>
            </span>
            <span className={`shrink-0 text-sm font-bold tabular-nums ${s.highlight ? "text-brand-yellow" : "text-white/45"}`}>
              {s.value}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-2xl border border-brand-green/25 bg-brand-green/[0.06] px-4 py-3 text-center text-sm text-white/75">
        Over <b className="text-white">$1,370 of detailing</b> on your first visit alone, plus a shot at <b className="text-white">$2,200</b>.
      </div>

      <div className="mt-6">
        <div className="text-center">
          <div className="flex items-end justify-center gap-1.5">
            <span className="mb-1 text-sm font-bold text-white/50">From</span>
            <span className="font-display text-4xl font-black text-white sm:text-5xl">$39</span>
            <span className="mb-1 text-sm font-bold text-white/50">/week</span>
          </div>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Pick your vehicle, join now</p>
        </div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {MEMBERSHIP_TIERS.map((t) => (
            <a
              key={t.key}
              href={t.link}
              className="flex items-center justify-between gap-2 rounded-full bg-brand-green px-5 py-3.5 font-display text-sm font-black text-brand-ink transition hover:brightness-110 active:scale-95"
            >
              <span className="flex items-center gap-2"><span className="text-base leading-none">{t.emoji}</span>{t.key}</span>
              <span aria-hidden>→</span>
            </a>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-white/45">Straight to secure checkout · cancel anytime</p>
      </div>
    </div>
  );
}
