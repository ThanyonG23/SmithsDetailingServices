import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Standard Detail Draw · Terms & Conditions | Smiths Detailing",
  description: "What's included in a Standard Detail, plus terms & conditions for the Smiths Detailing members' standard detail draw.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/detail-draw-terms" },
};

const LOGO = BUSINESS.logo;

const INCLUDED = [
  "Vacuum",
  "Plastics cleaned and rejuvenated",
  "Full exterior wash & dry",
  "Tyre shine",
  "Windows cleaned inside and out",
];

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
    heading: "3. Who can enter",
    body: "Entry is open to individuals who are 18 or older, are Australian residents, and hold an active Smiths Detailing membership in good standing (payments up to date) as at the time of the draw. Employees of Smiths and their immediate families are not eligible.",
  },
  {
    heading: "4. How to enter, it's free and automatic",
    body: "Every eligible member is automatically entered. There is nothing extra to buy or do, and no additional cost beyond your normal membership. One (1) entry per member per draw.",
  },
  {
    heading: "5. The prize",
    body: "There is one (1) winner, who receives one (1) Standard Detail (valued at approximately $150), carried out on their vehicle at our Cairns workshop. A Standard Detail includes everything listed in the “What's included” section above and takes approximately 2 to 3 hours.",
    note: "The prize is not transferable, not exchangeable, and has no cash alternative. It must be booked and redeemed at our Cairns workshop within 3 months of the draw, subject to availability, on a vehicle in ordinary condition (excessive dirt, damage, pet hair or rust may be quoted separately or excluded). One vehicle per prize.",
  },
  {
    heading: "6. The draw",
    body: "The winner is drawn at random on the date and time advertised for that particular draw, at our Cairns workshop. The draw may be recorded and shared on our channels.",
  },
  {
    heading: "7. Notifying the winner",
    body: "The winner will be contacted directly by phone or email within 2 business days of the draw, and announced on our social media (first name and initial only). If the winner cannot be contacted or does not claim the prize within 14 days, we may redraw.",
  },
  {
    heading: "8. General",
    body: "If the prize becomes unavailable for reasons beyond our control, we may substitute a prize of equal or greater value. We may verify a winner's eligibility and disqualify any entry that breaches these terms. We may vary the frequency of these draws or stop running them at any time. Our decisions are final, subject to law.",
  },
  {
    heading: "9. Privacy",
    body: "We collect entrants' details only to run this promotion and contact the winner, in line with our Privacy Policy. The winner consents to us publishing their first name and initial as above.",
  },
  {
    heading: "10. Your consumer rights",
    body: "Nothing in these terms excludes, restricts or modifies any rights you have under the Australian Consumer Law.",
  },
  {
    heading: "11. Governing law",
    body: "These terms are governed by the law of Queensland.",
  },
];

export default function DetailDrawTermsPage() {
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
            Standard Detail Draw
          </h1>
          <p className="mt-2 text-sm text-white/40">Members&apos; draw · Cairns</p>
        </div>

        {/* What's included */}
        <div className="mt-10 rounded-2xl border border-brand-purple/30 bg-gradient-to-b from-brand-purple/[0.10] to-white/[0.02] p-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">The prize</div>
          <h2 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-white">
            What&apos;s included in a Standard Detail
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {INCLUDED.map((i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-white/85">
                <span className="mt-0.5 shrink-0 text-brand-purple-soft">✓</span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-white/70">
            ⏱️ <span>Takes 2 to 3 hours</span>
          </div>
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
                      <span className="mt-1 shrink-0 text-brand-purple-soft">✓</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
              {t.note && <p className="mt-3 text-[14px] leading-relaxed text-white/55">{t.note}</p>}
            </section>
          ))}

          <section>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-white">12. Contact</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/70">
              Questions about the draw? Call us on{" "}
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
          <p className="text-xs text-white/30">
            By being an active member at the time of the draw you are automatically entered and accept these terms.
          </p>
        </footer>
      </div>
    </main>
  );
}
