import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";
import RefTracker from "@/components/RefTracker";
import { TEAM, getTeamMember } from "@/lib/referrals";
import { BUSINESS } from "@/lib/config";

/* A detailer's link. Deliberately identical to the homepage from the
   customer's side — no banner, nothing to explain or worry about. The only
   difference is that the quote button pre-fills their text with the
   detailer's code, which is rendered into the HTML here on the server so
   it works the instant the page appears. */

export function generateStaticParams() {
  return TEAM.map((m) => ({ code: m.code }));
}

export function generateMetadata({ params }: { params: { code: string } }): Metadata {
  if (!getTeamMember(params.code)) return {};
  return {
    title: `${BUSINESS.name} | Premium Car Detailing in Cairns`,
    // Keep these out of search results so they don't compete with the
    // real homepage.
    robots: { index: false, follow: true },
  };
}

export default function ReferralPage({ params }: { params: { code: string } }) {
  const member = getTeamMember(params.code);
  if (!member) notFound();

  return (
    <>
      {/* Remembers the code for 90 days, so it still counts if they come
          back to the plain homepage later and text from there. */}
      <RefTracker code={member.code} />
      <HomeContent refCode={member.code} />
    </>
  );
}
