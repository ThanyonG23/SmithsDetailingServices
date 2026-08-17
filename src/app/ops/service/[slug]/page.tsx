import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/ops/auth";
import { getServiceJob } from "@/lib/ops/db";
import ServiceCard from "@/components/ops/ServiceCard";

export const metadata: Metadata = {
  title: "Service card | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";

export default async function ServiceCardPage({ params }: { params: { slug: string } }) {
  requireAuth();
  const job = await getServiceJob(params.slug);
  if (!job) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <Link href="/ops/service" className="inline-flex rounded-full border border-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/60 transition hover:text-white">
        ← All services
      </Link>
      <div className={`${EYEBROW} mt-4`}>Service card</div>
      <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        {job.rego || "New service"}
        {job.vehicle && <span className="text-white/50"> · {job.vehicle}</span>}
      </h1>
      <ServiceCard initial={job} />
    </main>
  );
}
