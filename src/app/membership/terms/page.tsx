import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";
import { packagePrice, VEHICLE_SIZES } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Membership Terms · Smiths Garage",
  description: "Terms & conditions for the Smiths Garage Maintenance membership.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/membership/terms" },
};

const LOGO = "/smiths-garage-logo.png";

/* Standard (non-member) going rate for a basic, non-logbook service. Kept here
   so the cancellation clause quotes a real number; the detail half is read live
   from packages.ts so it always matches the staff templates. */
const SERVICE_GOING_RATE = 220;
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const FIRST_VISIT_PRICES = VEHICLE_SIZES.map((size) => {
  const detail = packagePrice("premium", size);
  // The paint work on its own = the "Premium + Cut & Polish" package less the
  // detail that's already counted in the table above, so nothing double-counts.
  const cutPolish = packagePrice("cutpolish", size) - detail;
  return { size, detail, service: SERVICE_GOING_RATE, cutPolish, total: detail + SERVICE_GOING_RATE };
});

const TERMS: { heading: string; body: string; firstVisitPrices?: boolean }[] = [
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
    body: "Once you've had your second visit there is no lock-in — you can cancel any time. Please give us at least 7 days' notice before your next payment so we can stop your billing. The sign-up fee is non-refundable. Cancelling before your second visit is covered separately below.",
  },
  {
    heading: "7. Cancelling before your second visit",
    body: "Your first visit — a full detail plus a basic service — is provided at a discounted member rate, on the understanding that you continue your membership. If you cancel before your second scheduled visit, that discount no longer applies: the first visit is charged at our standard, non-member going rate shown below, with the sign-up fee you've already paid credited toward it, so only the difference is payable. If your first visit also included a complimentary Cut & Polish — a limited-time sign-up bonus — its standard going rate is added on top, as listed under the table. Standard going rate for a first visit (full detail + basic service), by vehicle size:",
    firstVisitPrices: true,
  },
  {
    heading: "8. Vehicle condition",
    body: "Our pricing assumes a vehicle in normal condition. Excessive mess, pet hair or damage may require extra work, which we will always quote separately before starting.",
  },
  {
    heading: "9. Our promise",
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
              {t.firstVisitPrices && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-left text-[14px]">
                    <thead>
                      <tr className="bg-white/[0.04] text-white/50">
                        <th className="px-4 py-2.5 font-semibold">Vehicle</th>
                        <th className="px-4 py-2.5 font-semibold">Full detail</th>
                        <th className="px-4 py-2.5 font-semibold">Basic service</th>
                        <th className="px-4 py-2.5 text-right font-semibold text-white/70">Going rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FIRST_VISIT_PRICES.map((r) => (
                        <tr key={r.size} className="border-t border-white/[0.06]">
                          <td className="px-4 py-2.5 text-white/70">{r.size}</td>
                          <td className="px-4 py-2.5 text-white/50">{money(r.detail)}</td>
                          <td className="px-4 py-2.5 text-white/50">{money(r.service)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-white">{money(r.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {t.firstVisitPrices && (
                <p className="mt-3 text-[14px] leading-relaxed text-white/55">
                  <span className="font-semibold text-white/70">If a complimentary Cut &amp; Polish was included,</span> add its
                  standard going rate to the above:{" "}
                  {FIRST_VISIT_PRICES.map((r, i) => (
                    <span key={r.size}>
                      {i > 0 ? " · " : ""}
                      {r.size} {money(r.cutPolish)}
                    </span>
                  ))}
                  .
                </p>
              )}
            </section>
          ))}

          <section>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-white">10. Contact</h2>
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
