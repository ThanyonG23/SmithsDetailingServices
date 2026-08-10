import type { Metadata } from "next";
import { getInspection } from "@/lib/ops/db";
import { BUSINESS } from "@/lib/config";
import InspectionView from "@/components/InspectionView";

export const metadata: Metadata = {
  title: "Your recommended extras | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default async function CustomerInspectionPage({ params }: { params: { slug: string } }) {
  const insp = await getInspection(params.slug).catch(() => null);

  return (
    <main className="brand-backdrop min-h-screen bg-[#050506] text-white">
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-9 w-auto sm:h-10" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-24 pt-8">
        {!insp || insp.items.length === 0 ? (
          <div className="mt-10 text-center">
            <div className="text-5xl">🚗✨</div>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-white">
              Nothing to show here yet
            </h1>
            <p className="mt-2 text-sm text-white/50">
              This link isn&apos;t ready or has expired. If you think that&apos;s a mistake, just reply
              to our message and we&apos;ll sort it.
            </p>
          </div>
        ) : (
          <InspectionView
            slug={insp.slug}
            customerName={insp.customer_name}
            vehicle={insp.vehicle}
            items={insp.items}
            alreadyResponded={insp.status === "responded"}
          />
        )}
      </div>
    </main>
  );
}
