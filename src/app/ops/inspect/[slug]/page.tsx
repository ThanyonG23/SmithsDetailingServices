import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/ops/auth";
import { getInspection } from "@/lib/ops/db";
import InspectionBuilder from "@/components/ops/InspectionBuilder";

export const metadata: Metadata = {
  title: "Inspection | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";

export default async function InspectionBuilderPage({ params }: { params: { slug: string } }) {
  requireAuth();
  const insp = await getInspection(params.slug);
  if (!insp) notFound();

  const chosen = insp.items.filter((i) => i.selected);
  const chosenTotal = chosen.reduce((a, i) => a + i.price, 0);

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <Link
        href="/ops/inspect"
        className="inline-flex rounded-full border border-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/60 transition hover:text-white"
      >
        ← All inspections
      </Link>
      <div className={`${EYEBROW} mt-4`}>Inspection</div>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {insp.customer_name || "Walk-in"}
        {insp.vehicle && <span className="text-white/50"> · {insp.vehicle}</span>}
      </h1>

      {insp.status === "responded" && (
        <div className="mt-5 rounded-2xl border border-brand-green/40 bg-brand-green/[0.06] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-green">
            ✓ Customer replied
          </div>
          <div className="mt-2 text-sm text-white/80">
            They want <b className="text-brand-green">{chosen.length}</b> of {insp.items.length} extras
            {" · "}
            <b className="text-brand-green">{money(chosenTotal)}</b>:
          </div>
          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-white/70 marker:text-brand-green">
            {chosen.map((c) => (
              <li key={c.id}>
                {c.title} — {money(c.price)}
              </li>
            ))}
            {chosen.length === 0 && <li className="list-none text-white/45">— none selected</li>}
          </ul>
          {insp.customer_note && (
            <div className="mt-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/70">
              “{insp.customer_note}”
            </div>
          )}
        </div>
      )}

      <InspectionBuilder slug={insp.slug} initialItems={insp.items} status={insp.status} />
    </main>
  );
}
