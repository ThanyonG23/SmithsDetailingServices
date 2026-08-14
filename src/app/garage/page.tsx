import type { Metadata } from "next";
import Link from "next/link";
import GarageWaitlist from "@/components/GarageWaitlist";
import { GARAGE_SERVICES, MEMBERSHIP_NAME, MEMBERSHIP_PERKS } from "@/lib/garage";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Smiths Garage — Coming Soon | Cairns",
  description:
    "Smiths Detailing is becoming Smiths Garage — detailing, paint correction, servicing, touch-up paint, headlight restoration and parts, all under one roof in Cairns. Join the waitlist.",
  // Soft launch — keep it out of search until the public rebrand goes live.
  robots: { index: false, follow: false },
  alternates: { canonical: "/garage" },
};

export default function GaragePage() {
  return (
    <main className="relative mx-auto max-w-3xl px-5 py-16 sm:py-24">
      {/* eyebrow */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-yellow">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-yellow" />
          Coming soon · Cairns
        </span>
      </div>

      {/* hero */}
      <h1 className="mt-6 text-center font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
        Smiths <span className="text-brand-green">Garage</span>
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-center text-lg leading-relaxed text-white/65">
        The detailing you know us for is growing up. Everything your car needs to look sharp and
        run right — <span className="text-white/85">under one roof.</span>
      </p>

      {/* services */}
      <section className="mt-16">
        <div className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            What we&apos;ll offer
          </div>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white">
            One place for the whole car
          </h2>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {GARAGE_SERVICES.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none">{s.icon}</span>
                <div>
                  <div className="font-display text-base font-extrabold tracking-tight text-white">
                    {s.name}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">{s.blurb}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* membership */}
      <section className="mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-brand-green/25 bg-gradient-to-b from-brand-green/[0.08] to-transparent p-7 sm:p-9">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-green">
            The big one
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white">
            {MEMBERSHIP_NAME}
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
            Stop thinking about your car. On the membership it&apos;s detailed and serviced on a
            schedule — always clean, always roadworthy — for one simple monthly payment.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {MEMBERSHIP_PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-[15px] text-white/80">
                <span className="mt-0.5 shrink-0 text-brand-green">✓</span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* waitlist */}
      <section className="mt-16 scroll-mt-8" id="waitlist">
        <GarageWaitlist />
      </section>

      {/* footer */}
      <footer className="mt-16 text-center text-sm text-white/40">
        <div>
          {BUSINESS.name} · {BUSINESS.address}
        </div>
        <Link href="/" className="mt-2 inline-block text-white/55 underline underline-offset-4 hover:text-white">
          ← Back to Smiths Detailing
        </Link>
      </footer>
    </main>
  );
}
