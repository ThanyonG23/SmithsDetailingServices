import type { Metadata } from "next";
import { requireAuth } from "@/lib/ops/auth";
import { getTeamDay, type TeamJob } from "@/lib/ops/db";
import { OPS_STAFF, cairnsToday } from "@/lib/ops/config";
import TeamBoard from "@/components/ops/TeamBoard";

export const metadata: Metadata = {
  title: "Team | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";

export default async function TeamPage() {
  requireAuth();

  const today = cairnsToday();
  const since = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(
    new Date(Date.now() - 13 * 86400000)
  );

  let jobs: TeamJob[] = [];
  let dbError = false;
  try {
    jobs = await Promise.race([
      getTeamDay(today, since),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 20000)),
    ]);
  } catch {
    dbError = true;
  }

  const dateLabel = new Date(`${today}T00:00:00+10:00`).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Brisbane",
  });

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        The <span className="text-brand-green">Team</span>
      </h1>
      <p className="mt-2 text-sm font-semibold text-white/50">{dateLabel} · today&apos;s cars</p>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database didn&apos;t respond — wait a moment and refresh.
        </div>
      )}

      <TeamBoard jobs={jobs} staff={OPS_STAFF} />

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Crew
      </p>
    </main>
  );
}
