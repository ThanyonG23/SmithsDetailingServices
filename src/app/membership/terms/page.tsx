import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Membership Terms · Smiths Garage",
  description: "Terms & conditions for the Smiths Garage Maintenance membership.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/membership/terms" },
};

const LOGO = "/smiths-garage-logo.png";

const TERMS: { heading: string; body: string }[] = [
  {
    heading: "1. The membership",
    body: "Smiths Garage Maintenance keeps your vehicle detailed and serviced on a schedule. Every 3 months we carry out a full interior and exterior detail plus a top-up and health check. Every 6 months, that visit also includes a basic service (oil change, filter and checks). Priority booking is included for members.",
  },
  {
    heading: "2. Payments",
    body: "Your membership has a one-off sign-up fee and an ongoing weekly fee, both based on your vehicle size. The weekly fee is billed automatically each week and continues until you cancel. Your price is confirmed with you before you join.",
  },
  {
    heading: "3. Your sign-up fee",
    body: "The sign-up fee covers your first full detail and service. It is non-refundable once your first visit has been booked or completed.",
  },
  {
    heading: "4. Booking & rescheduling",
    body: "We book your visits with you. If you need to move an appointment, we ask for at least 48 hours' notice so we can offer the spot to someone else.",
  },
  {
    heading: "5. Missed appointments",
    body: "If you miss a booked appointment without giving at least 48 hours' notice, that visit may be treated as used. Your weekly payments continue as normal.",
  },
  {
    heading: "6. Cancelling",
    body: "There is no lock-in contract — you can cancel any time. Please give us at least 7 days' notice before your next payment so we can stop your billing. The sign-up fee is non-refundable.",
  },
  {
    heading: "7. Vehicle condition",
    body: "Our pricing assumes a vehicle in normal condition. Excessive mess, pet hair or damage may require extra work, which we will always quote separately before starting.",
  },
  {
    heading: "8. Our promise",
    body: "We hold the same standard we always have. If you're not happy with a visit, tell us and we'll make it right.",
  },
];

export default function MembershipTermsPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths Garage" className="mx-auto w-full max-w-[220px] mix-blend-screen" />
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Membership Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-white/40">Smiths Garage Maintenance · Last updated August 2026</p>
        </div>

        <div className="mt-10 flex flex-col gap-7">
          {TERMS.map((t) => (
            <section key={t.heading}>
              <h2 className="font-display text-lg font-extrabold tracking-tight text-white">{t.heading}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-white/70">{t.body}</p>
            </section>
          ))}

          <section>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-white">9. Contact</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/70">
              Questions? Call us on{" "}
              <a href={`tel:${BUSINESS.phoneE164}`} className="font-semibold text-brand-purple-soft hover:text-white">
                {BUSINESS.phone}
              </a>{" "}
              or email{" "}
              <a href={`mailto:${BUSINESS.email}`} className="font-semibold text-brand-purple-soft hover:text-white">
                {BUSINESS.email}
              </a>
              .
            </p>
          </section>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-6 text-center">
          <Link href="/membership/join" className="text-sm text-white/50 underline underline-offset-4 transition hover:text-white">
            ← Back to sign-up
          </Link>
        </footer>
      </div>
    </main>
  );
}
