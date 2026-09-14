import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Member Draw · Terms & Conditions | Smiths Detailing",
  description: "Terms & conditions for the Smiths Detailing member draw.",
  robots: { index: false, follow: false }, // draft, not linked or indexed yet
  alternates: { canonical: "/draw-terms" },
};

const LOGO = BUSINESS.logo;

type Term = { heading: string; body: string; choices?: string[]; note?: string };

const TERMS: Term[] = [
  {
    heading: "1. The promoter",
    body: "Smiths Detailing Services (ABN 70 600 522 475), of 209 Bunda Street, Parramatta Park, Cairns QLD (“Smiths”, “we”, “us”).",
  },
  {
    heading: "2. This is a game of chance",
    body: "The winner is chosen at random. No skill is involved.",
  },
  {
    heading: "3. Entries close",
    body: "Entry is based on your Smiths membership being active (payments up to date) as at 8:00pm AEST on 1 October 2026, when entries close (the eligibility cut-off).",
  },
  {
    heading: "4. Who can enter",
    body: "Entry is open to individuals who are 18 or older, are Australian residents, and hold an active Smiths membership in good standing (payments up to date) as at the eligibility cut-off in clause 3. Employees of Smiths and their immediate families are not eligible.",
  },
  {
    heading: "5. How to enter, it's free and automatic",
    body: "Every eligible member is automatically entered. There is nothing extra to buy or do, and no additional cost beyond your normal membership. The number of entries you receive depends on your membership tier, as set out in clause 6.",
  },
  {
    heading: "6. Entries by membership tier",
    body: "Higher membership tiers receive more entries in the draw, as follows:",
    choices: [
      "Standard monthly member or 30-day pass: 1 entry",
      "Annual member or Platinum monthly member: 5 entries",
      "Platinum annual member: 10 entries",
    ],
    note: "Your entry count is based on your membership tier as at the eligibility cut-off in clause 3.",
  },
  {
    heading: "7. The prize",
    body: "There is one (1) winner, who receives a premium interior and exterior detail plus cut and polish, carried out at our Cairns workshop, which includes:",
    choices: [
      "Paint correction (cut and polish)",
      "Full interior detail",
      "Exterior deep clean",
      "Plastics rejuvenated",
      "Engine bay detail",
    ],
    note: "Approximate retail value: $1,000. The prize is a service only. It has no cash alternative, is not transferable, and cannot be split or exchanged. It must be booked and redeemed at our Cairns workshop within 6 months of the draw, subject to availability, on a vehicle in ordinary condition (excessive damage, rust, or oversized vehicles may be quoted separately or incur an additional charge).",
  },
  {
    heading: "8. The draw",
    body: "The winner will be drawn at random on or shortly after 8:00pm AEST on 1 October 2026 at our Cairns workshop. The draw may be recorded.",
  },
  {
    heading: "9. Notifying the winner",
    body: "The winner will be contacted directly by phone or email within 2 business days of the draw, and announced on our social media (first name and initial only). If the winner cannot be contacted or does not claim the prize within 14 days, we may redraw.",
  },
  {
    heading: "10. General",
    body: "The prize is not exchangeable or redeemable for cash. If the prize becomes unavailable for reasons beyond our control, we may substitute a prize of equal or greater value. We may verify a winner's eligibility and disqualify any entry that breaches these terms. Our decisions are final, subject to law.",
  },
  {
    heading: "11. Privacy",
    body: "We collect entrants' details only to run this promotion and contact the winner, in line with our Privacy Policy. The winner consents to us publishing their first name and initial as above.",
  },
  {
    heading: "12. Your consumer rights",
    body: "Nothing in these terms excludes, restricts or modifies any rights you have under the Australian Consumer Law.",
  },
  {
    heading: "13. Governing law",
    body: "These terms are governed by the law of Queensland.",
  },
];

export default function DrawTermsPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20">
        <Link
          href="/membership"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-white"
        >
          ← Back to membership
        </Link>
        <div className="mt-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Smiths Detailing" className="mx-auto w-full max-w-[220px]" />
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Member Draw, Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-white/40">Smiths Detailing Member Draw · Cairns</p>
        </div>

        <div className="mt-10 flex flex-col gap-7">
          {TERMS.map((t) => (
            <section key={t.heading}>
              <h2 className="font-display text-lg font-extrabold tracking-tight text-white">{t.heading}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-white/70">{t.body}</p>
              {t.choices && (
                <ul className="mt-3 flex flex-col gap-2">
                  {t.choices.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-white/80">
                      <span className="mt-1 shrink-0 text-brand-green">✓</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
              {t.note && <p className="mt-3 text-[14px] leading-relaxed text-white/55">{t.note}</p>}
            </section>
          ))}

          <section>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-white">14. Contact</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/70">
              Questions about the draw? Call us on{" "}
              <a href={`tel:${BUSINESS.phoneE164}`} className="font-semibold text-brand-green hover:text-white">
                {BUSINESS.phone}
              </a>{" "}
              or email{" "}
              <a href={`mailto:${BUSINESS.email}`} className="font-semibold text-brand-green hover:text-white">
                {BUSINESS.email}
              </a>
              .
            </p>
          </section>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/30">
            By being an active member as at the eligibility cut-off you are automatically entered and accept these terms.
          </p>
        </footer>
      </div>
    </main>
  );
}
