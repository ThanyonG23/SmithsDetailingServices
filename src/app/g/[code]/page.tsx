import { redirect } from "next/navigation";
import type { Metadata } from "next";
import MembershipContent from "@/components/MembershipContent";
import AffTracker from "@/components/AffTracker";
import { affiliateExists } from "@/app/ops/affiliates/actions";

/* An affiliate's giveaway link. Identical to the membership page from the
   visitor's side; the only difference is AffTracker drops a 90-day cookie so
   any resulting signup is attributed to this affiliate at checkout. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Smiths Membership | Cairns",
  robots: { index: false, follow: true },
};

export default async function AffiliateLanding({ params }: { params: { code: string } }) {
  const ok = await affiliateExists(params.code);
  if (!ok) redirect("/membership");
  return (
    <>
      <AffTracker code={params.code} />
      <div className="bg-brand-green/[0.12] px-4 py-2.5 text-center text-sm font-black uppercase tracking-[0.06em] text-brand-green">
        🎁 You&apos;re in for double entries, twice the chance to win in every draw
      </div>
      <MembershipContent />
    </>
  );
}
