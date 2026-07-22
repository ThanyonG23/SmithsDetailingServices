import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Home from "@/app/page";
import RefTracker from "@/components/RefTracker";
import { TEAM, getTeamMember } from "@/lib/referrals";
import { BUSINESS } from "@/lib/config";

/* Pre-build a page for every detailer in the TEAM list. */
export function generateStaticParams() {
  return TEAM.map((m) => ({ code: m.code }));
}

export function generateMetadata({ params }: { params: { code: string } }): Metadata {
  const member = getTeamMember(params.code);
  if (!member) return {};
  return {
    title: `${member.name} at ${BUSINESS.name} | Premium Car Detailing in Cairns`,
    // Their link gets shared around — don't let search engines index
    // duplicates of the homepage.
    robots: { index: false, follow: true },
  };
}

export default function ReferralPage({ params }: { params: { code: string } }) {
  const member = getTeamMember(params.code);
  if (!member) notFound();

  return (
    <>
      <RefTracker code={member.code} />

      {/* Someone who's left keeps a working link — their old posts still send
          us customers — but we drop the personal greeting. */}
      {!member.retired && (
        <div className="border-b border-brand-green/20 bg-brand-green/[0.07]">
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2.5 text-center text-xs font-bold text-brand-green sm:text-sm">
            <span aria-hidden>✅</span>
            <span>
              You&apos;re here from {member.name}
              {member.handle ? ` (@${member.handle})` : ""} — quote us and we&apos;ll look
              after you.
            </span>
          </div>
        </div>
      )}

      <Home />
    </>
  );
}
