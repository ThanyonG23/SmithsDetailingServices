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
    heading: "3. Eligibility cut-off",
    body: "Entry is based on your Smiths Detailing membership being active (payments up to date) as at 11:59pm AEST on 29 September 2026, the eligibility cut-off.",
  },
  {
    heading: "4. Who can enter",
    body: "Entry is open to individuals who are 18 or older, are Australian residents, and hold an active Smiths Detailing membership in good standing (payments up to date) as at the eligibility cut-off in clause 3. Employees of Smiths and their immediate families are not eligible.",
  },
  {
    heading: "5. How to enter, it's free and automatic",
    body: "Every eligible member is automatically entered. There is nothing extra to buy or do, and no additional cost beyond your normal membership. One (1) entry per member.",
  },
  {
    heading: "6. The prize",
    body: "There is one (1) winner, who chooses one of the following:",
    choices: [
      "$1,000 cash, paid by bank transfer; or",
      "A Paint Correction & Ceramic Coating package, valued at up to $2,200, carried out at our Cairns workshop.",
    ],
    note: "Total prize value: up to $2,200. The prize is not transferable and cannot be split part-cash / part-service. If the winner chooses the detailing package, it must be booked and redeemed at our Cairns workshop within 6 months of the draw, subject to availability, on a vehicle in ordinary condition (excessive damage or rust will be quoted separately).",
  },
  {
    heading: "7. The draw",
    body: "The winner will be drawn at random on 30 September 2026 at our Cairns workshop. The draw may be recorded.",
  },
  {
    heading: "8. Notifying the winner",
    body: "The winner will be contacted directly by phone or email within 2 business days of the draw, and announced on our social media (first name and initial only). If the winner cannot be contacted or does not claim the prize within 14 days, we may redraw.",
  },
  {
    heading: "9. General",
    body: "The prize is not exchangeable or redeemable for cash except as set out above. If the prize becomes unavailable for reasons beyond our control, we may substitute a prize of equal or greater value. We may verify a winner's eligibility and disqualify any entry that breaches these terms. Our decisions are final, subject to law.",
  },
  {
    heading: "10. Privacy",
    body: "We collect entrants' details only to run this promotion and contact the winner, in line with our Privacy Policy. The winner consents to us publishing their first name and initial as above.",
  },
  {
    heading: "11. Your consumer rights",
    body: "Nothing in these terms excludes, restricts or modifies any rights you have under the Australian Consumer Law.",
  },
  {
    heading: "12. Governing law",
    body: "These terms are governed by the law of Queensland.",
  },
];

export default function DrawTermsPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20">
        <div className="text-center">
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
            <h2 className="font-display text-lg font-extrabold tracking-tight text-white">13. Contact</h2>
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
