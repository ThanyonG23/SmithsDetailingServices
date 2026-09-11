import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";
import { getSessionEmail } from "@/lib/members/session";
import { getMember, upsertMember } from "@/lib/members/db";
import { findMembership, findMembershipByCustomer } from "@/lib/members/stripe";
import { openDraws, PARTNERS } from "@/lib/members/portal";
import LoginForm from "@/components/account/LoginForm";
import SetPasswordCard from "@/components/account/SetPasswordCard";
import ReferralCard from "@/components/account/ReferralCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Members · Smiths",
  description: "Sign in to your Smiths membership.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/account" },
};

const LOGO = BUSINESS.logo;

function statusLabel(s: string): { text: string; live: boolean } {
  if (s === "active") return { text: "Active", live: true };
  if (s === "trialing") return { text: "Trial", live: true };
  if (s === "past_due") return { text: "Payment due", live: true };
  return { text: "Inactive", live: false };
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default async function AccountPage({ searchParams }: { searchParams: { e?: string } }) {
  const email = getSessionEmail();

  // ── Signed out: sign-in form ──
  if (!email) {
    const err = searchParams?.e === "link" ? "That link was invalid or expired. Enter your email for a fresh one." : "";
    return (
      <Shell>
        <div className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Members</div>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Sign in</h1>
        </div>
        <div className="mt-7">
          <LoginForm initialError={err} />
        </div>
        <p className="mt-6 text-center text-sm text-white/50">
          Not a member yet?{" "}
          <Link href="/membership" className="font-bold text-brand-purple-soft underline underline-offset-4 hover:text-white">
            Join for $1
          </Link>
        </p>
      </Shell>
    );
  }

  // ── Signed in: resolve membership. Prefer the cached Stripe customer id
  //    (no email-case issues), then fall back to an email lookup. ──
  const cached = await getMember(email);
  let live = cached?.stripe_customer_id
    ? await findMembershipByCustomer(cached.stripe_customer_id)
    : null;
  if (!live) live = await findMembership(email);
  if (live) {
    await upsertMember({
      email,
      name: live.name,
      stripe_customer_id: live.customerId,
      stripe_subscription_id: live.subscriptionId,
      plan: live.plan,
      status: live.status,
      current_period_end: live.currentPeriodEnd,
    });
  }

  const name = (live?.name || cached?.name || "").split(" ")[0];
  const status = live?.status || cached?.status || "";
  const plan = live?.plan || cached?.plan || "Membership";
  const periodEnd = live?.currentPeriodEnd || cached?.current_period_end || null;
  const badge = statusLabel(status);
  const draws = openDraws();
  const isPlatinum = /platinum/i.test(plan);
  const entries = live?.entries ?? 1;
  const entryLabel = `${entries} ${entries === 1 ? "entry" : "entries"}`;

  return (
    <Shell wide>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">Members</div>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {name ? `Hey ${name}` : "Your membership"}
          </h1>
        </div>
        <a href="/account/logout" className="text-xs font-semibold text-white/50 underline underline-offset-4 hover:text-white">
          Sign out
        </a>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        {/* left column */}
        <div className="flex flex-col gap-6">
      {/* Membership */}
      <section className="rounded-2xl border border-brand-purple/40 bg-gradient-to-b from-brand-purple/[0.12] to-white/[0.02] p-5 shadow-[0_0_60px_-24px_rgba(124,47,245,0.6)]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">Your membership</div>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
              badge.live ? "bg-brand-green/15 text-brand-green" : "bg-white/10 text-white/60"
            }`}
          >
            {badge.text}
          </span>
        </div>
        <div className="mt-3 font-display text-xl font-extrabold text-white">{plan}</div>
        {periodEnd && badge.live && (
          <div className="mt-1 text-sm text-white/55">Renews {fmtDate(periodEnd)}</div>
        )}
        {!badge.live && (
          <div className="mt-1 text-sm text-white/55">We couldn&apos;t confirm an active membership on this email.</div>
        )}
        <div className="mt-4 flex flex-wrap gap-2.5">
          <a
            href="/account/billing"
            className="inline-flex items-center justify-center rounded-full bg-brand-purple px-5 py-2.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95"
          >
            Manage billing
          </a>
          {!badge.live && (
            <Link
              href="/membership"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 font-display text-sm font-bold text-white transition hover:border-white/40"
            >
              Rejoin
            </Link>
          )}
        </div>
      </section>

      {/* Platinum upsell */}
      {!isPlatinum && (
        <section className="rounded-2xl border border-brand-yellow/40 bg-gradient-to-b from-brand-yellow/[0.10] to-white/[0.02] p-5 shadow-glowY">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-yellow">Upgrade</div>
          <h2 className="mt-1.5 font-display text-xl font-extrabold text-white">Go Platinum</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-white/60">
            Better perks and more entries into every draw, 20% off all detailing, priority access, and up to 10 free
            entries.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-brand-yellow/30 bg-white/[0.02] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-yellow">Monthly</div>
              <div className="mt-1 flex items-end gap-1">
                <span className="font-display text-2xl font-black text-white">$24.99</span>
                <span className="mb-1 text-xs text-white/50">/mo</span>
              </div>
              <ul className="mt-2 flex flex-1 flex-col gap-1 text-xs text-white/70">
                <li>✓ 20% off all detailing</li>
                <li>✓ Priority access</li>
                <li className="text-brand-yellow">🎁 5 free entries every draw</li>
              </ul>
              <a href="https://buy.stripe.com/9B63cv07C3rv0Mg5dN6kg0F" className="mt-3 block rounded-full bg-brand-yellow px-4 py-2.5 text-center font-display text-xs font-black text-brand-ink transition hover:brightness-110 active:scale-95">
                Go Platinum →
              </a>
            </div>
            <div className="flex flex-col rounded-xl border border-brand-yellow/30 bg-white/[0.02] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-yellow">Yearly · best value</div>
              <div className="mt-1 flex items-end gap-1">
                <span className="font-display text-2xl font-black text-white">$199</span>
                <span className="mb-1 text-xs text-white/50">/yr</span>
              </div>
              <ul className="mt-2 flex flex-1 flex-col gap-1 text-xs text-white/70">
                <li>✓ 20% off all detailing</li>
                <li>✓ Priority access</li>
                <li className="text-brand-yellow">🎁 10 free entries every draw</li>
              </ul>
              <a href="https://buy.stripe.com/4gM14ndYsd258eI35F6kg0I" className="mt-3 block rounded-full bg-brand-yellow px-4 py-2.5 text-center font-display text-xs font-black text-brand-ink transition hover:brightness-110 active:scale-95">
                Go Platinum yearly →
              </a>
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] text-white/35">
            Already on another plan? Manage or cancel it under Manage billing above.
          </p>
        </section>
      )}

      {/* Bring a Mate referral */}
      {badge.live && <ReferralCard />}
        </div>

        {/* right column */}
        <div className="flex flex-col gap-6">
      {/* My draws */}
      <section>
        <h2 className="font-display text-lg font-extrabold tracking-tight text-white">Draws you&apos;re in</h2>
        {draws.length > 0 && (
          <p className="mt-1 text-sm text-white/55">
            You get <b className="text-brand-purple-soft">{entryLabel}</b> into every draw below.
          </p>
        )}
        {draws.length === 0 ? (
          <p className="mt-2 text-sm text-white/55">No draws are open right now. We&apos;ll let you know when the next one drops.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {draws.map((d) => (
              <div key={d.id} className="flex gap-4 overflow-hidden rounded-2xl border border-brand-purple/25 bg-white/[0.02] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.poster} alt={d.title} className="h-20 w-32 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-brand-green">
                      🎁 You have {entryLabel}
                    </span>
                  </div>
                  <div className="mt-1 font-display text-sm font-extrabold text-white">{d.prize}</div>
                  <div className="mt-0.5 text-xs text-white/50">Drawn {fmtDate(d.drawAt)}</div>
                  <Link href={d.termsHref} className="mt-1 inline-block text-xs font-semibold text-brand-purple-soft underline underline-offset-4 hover:text-white">
                    Draw terms
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Partner businesses */}
      <section>
        <h2 className="font-display text-lg font-extrabold tracking-tight text-white">Partner businesses</h2>
        {PARTNERS.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-brand-purple/30 bg-brand-purple/[0.05] p-5 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-purple-soft">Coming soon</div>
            <p className="mt-1.5 text-sm text-white/60">
              We&apos;re signing up local businesses so your membership saves you money all over Cairns. Your discounts will show up here.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {PARTNERS.map((p) => (
              <div key={p.name} className="rounded-2xl border border-brand-purple/25 bg-white/[0.02] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-purple-soft">{p.category}</div>
                <div className="mt-1 font-display text-base font-extrabold text-white">{p.name}</div>
                <div className="mt-0.5 text-sm text-white/70">{p.discount}</div>
              </div>
            ))}
          </div>
        )}
      </section>
        </div>
      </div>

      {/* Password — very bottom */}
      <SetPasswordCard hasPassword={!!cached?.password_hash} />
    </Shell>
  );
}

function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-10 h-[360px] w-[360px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className={`relative mx-auto ${wide ? "max-w-5xl" : "max-w-lg"} px-5 pb-20 pt-12 sm:pt-16`}>
          <div className="mb-8 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Link href="/">
              <img src={LOGO} alt="Smiths Detailing" className="mx-auto w-full max-w-[180px]" />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
